import json
from supabase import create_client, Client
from tqdm import tqdm
import logging
import time
from typing import Dict, Set, List
from config import SUPABASE_URL, SUPABASE_KEY, BATCH_SIZE
import sys
import backoff

# Set up logging
file_handler = logging.FileHandler('migration.log')
file_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

# Only errors to console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.ERROR)
console_handler.setFormatter(formatter)

logger = logging.getLogger('migration')
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

class LogoMigration:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.tag_cache: Dict[str, str] = {}  # Cache tag_name -> tag_id
        self.retry_count = 3
        self.retry_delay = 5  # seconds

    def transform_logo_url(self, url: str) -> str:
        """Transform WorldVectorLogo CDN URL to VectorLogoHub CDN URL."""
        return url.replace('cdn.worldvectorlogo.com/logos', 'cdn.vectorlogohub.com')

    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def insert_tag(self, tag: str) -> str:
        """Insert a tag and return its ID with retry logic."""
        try:
            # Case-insensitive search for existing tag
            result = self.supabase.table('tags').select('id').ilike('name', tag).execute()
            if result.data:
                return result.data[0]['id']

            # Only create new tag if it doesn't exist
            slug = tag.lower().replace(' ', '-')
            result = self.supabase.table('tags').insert({
                "name": tag,  # Preserve original case
                "slug": slug
            }).execute()
            
            return result.data[0]['id']
        except Exception as e:
            logger.error(f"Error inserting tag {tag}: {str(e)}")
            raise

    def insert_tags(self, unique_tags: Set[str]) -> None:
        """Insert unique tags and cache their IDs."""
        logger.info(f"Inserting {len(unique_tags)} unique tags...")
        for tag in tqdm(unique_tags, desc="Inserting tags", leave=True):
            try:
                # Only process if not already in cache
                if tag not in self.tag_cache:
                    tag_id = self.insert_tag(tag)
                    self.tag_cache[tag] = tag_id
            except Exception as e:
                logger.error(f"Failed to process tag {tag}: {str(e)}")

    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def process_logo(self, logo: dict) -> str:
        """Insert a logo and return its ID with retry logic."""
        try:
            # First check if logo exists
            result = self.supabase.table('logos').select('id').eq('url_path', logo["metadata"]["url_path"]).execute()
            if result.data:
                logger.debug(f"Skipping existing logo: {logo['title']}")
                return result.data[0]['id']

            # Prepare logo data
            logo_data = {
                "title": logo["title"],
                "logo_url": self.transform_logo_url(logo["logo_url"]),
                "logo_alt": logo["logo_alt"],
                "url_path": logo["metadata"]["url_path"],
            }

            # Add primary tag if logo has tags
            if logo["tags"]:
                primary_tag = logo["tags"][0]
                if primary_tag in self.tag_cache:
                    logo_data["primary_tag_id"] = self.tag_cache[primary_tag]
            
            result = self.supabase.table('logos').insert(logo_data).execute()
            logger.debug(f"Inserted new logo: {logo['title']}")
            return result.data[0]['id']
        except Exception as e:
            logger.error(f"Error processing logo {logo['title']}: {str(e)}")
            raise

    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def create_logo_tag_relations(self, logo_id: str, tags: List[str]) -> None:
        """Create logo-tag relationships with retry logic."""
        try:
            tag_relations = [
                {
                    "logo_id": logo_id,
                    "tag_id": self.tag_cache[tag],
                    "position": pos
                }
                for pos, tag in enumerate(tags)
                if tag in self.tag_cache
            ]
            
            if tag_relations:
                self.supabase.table('logo_tags').insert(tag_relations).execute()
        except Exception as e:
            logger.error(f"Error creating logo-tag relations: {str(e)}")
            raise

    def migrate(self, json_file: str, limit: int = None) -> None:
        """Main migration function."""
        logger.info("Starting migration...")
        
        # Load and filter JSON data
        with open(f"data/{json_file}", 'r') as f:
            data = json.load(f)
        
        valid_logos = [
            logo for logo in data 
            if logo["url"].startswith("https://worldvectorlogo.com/logo/")
        ]

        if limit:
            valid_logos = valid_logos[:limit]
            logger.info(f"Limited to processing {limit} logos")
        
        # Collect unique tags
        unique_tags = set()
        for logo in valid_logos:
            if not logo["tags"]:
                continue
            unique_tags.update(logo["tags"])
        
        # Insert tags first
        self.insert_tags(unique_tags)
        
        # Process logos in batches
        total_batches = (len(valid_logos) - 1) // BATCH_SIZE + 1
        logger.info(f"Processing {len(valid_logos)} logos in {total_batches} batches...")
        
        for i in range(0, len(valid_logos), BATCH_SIZE):
            batch = valid_logos[i:i + BATCH_SIZE]
            logger.info(f"Processing batch {i//BATCH_SIZE + 1} of {total_batches}")
            
            for logo in tqdm(batch, desc=f"Batch {i//BATCH_SIZE + 1}", leave=True):
                try:
                    logo_id = self.process_logo(logo)
                    if logo_id and logo["tags"]:  # Create tag relations only if logo has tags
                        self.create_logo_tag_relations(logo_id, logo["tags"])
                except Exception as e:
                    logger.error(f"Failed to process logo {logo['title']}: {str(e)}")
                    continue

        logger.info("Migration completed!")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Migrate logo data to Supabase')
    parser.add_argument('--limit', type=int, help='Limit number of logos to process')
    args = parser.parse_args()

    try:
        migrator = LogoMigration()
        migrator.migrate('master_logo_details.json', limit=args.limit)
    except KeyboardInterrupt:
        logger.info("Migration interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        sys.exit(1) 