import json
from supabase import create_client, Client
from tqdm import tqdm
import logging
from typing import Dict, Set, List
from config import SUPABASE_URL, SUPABASE_KEY, BATCH_SIZE

# Set up logging
file_handler = logging.FileHandler('migration.log')
file_handler.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.WARNING)  # Only show warnings and errors in console

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[file_handler, console_handler]
)

class LogoMigration:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.tag_cache: Dict[str, str] = {}  # Cache tag_name -> tag_id

    def transform_logo_url(self, url: str) -> str:
        """Transform WorldVectorLogo CDN URL to VectorLogoHub CDN URL."""
        return url.replace('cdn.worldvectorlogo.com/logos', 'cdn.vectorlogohub.com')

    def insert_tags(self, unique_tags: Set[str]) -> None:
        """Insert unique tags and cache their IDs."""
        logging.info(f"Inserting {len(unique_tags)} unique tags...")
        tags_list = list(unique_tags)  # Convert set to list for tqdm
        for tag in tqdm(tags_list, desc="Inserting tags", leave=True):
            try:
                result = self.supabase.table('tags').insert({"name": tag}).execute()
                if result.data:
                    self.tag_cache[tag] = result.data[0]['id']
            except Exception as e:
                logging.error(f"Error inserting tag {tag}: {str(e)}")

    def process_logo(self, logo: dict) -> str:
        """Insert a logo and return its ID."""
        try:
            # First check if logo exists
            result = self.supabase.table('logos') \
                .select('id') \
                .eq('url_path', logo["metadata"]["url_path"]) \
                .execute()

            # If logo exists, return its ID
            if result.data and len(result.data) > 0:
                logging.debug(f"Skipping existing logo: {logo['title']}")
                return result.data[0]['id']

            # If not exists, insert new logo
            logo_data = {
                "title": logo["title"],
                "logo_url": self.transform_logo_url(logo["logo_url"]),
                "logo_alt": logo["logo_alt"],
                "url_path": logo["metadata"]["url_path"]
            }
            
            result = self.supabase.table('logos').insert(logo_data).execute()
            logging.debug(f"Inserted new logo: {logo['title']}")
            return result.data[0]['id']
        except Exception as e:
            logging.error(f"Error processing logo {logo['title']}: {str(e)}")
            return None

    def create_logo_tag_relations(self, logo_id: str, tags: List[str]) -> None:
        """Create logo-tag relationships."""
        for tag in tags:
            if tag in self.tag_cache:
                try:
                    self.supabase.table('logo_tags').insert({
                        "logo_id": logo_id,
                        "tag_id": self.tag_cache[tag]
                    }).execute()
                except Exception as e:
                    logging.error(f"Error creating logo-tag relation: {str(e)}")

    def migrate(self, json_file: str, limit: int = None) -> None:
        """
        Main migration function.
        
        Args:
            json_file: Path to JSON file
            limit: Optional limit on number of logos to process
        """
        logging.info("Starting migration...")
        
        # Load and filter JSON data
        with open(f"data/{json_file}", 'r') as f:
            data = json.load(f)
        
        valid_logos = [
            logo for logo in data 
            if logo["url"].startswith("https://worldvectorlogo.com/logo/")
        ]

        if limit:
            valid_logos = valid_logos[:limit]
            logging.info(f"Limited to processing {limit} logos")
        
        # Collect unique tags from the limited set
        unique_tags = set()
        for logo in valid_logos:
            unique_tags.update(logo["tags"])
        
        # Insert tags first
        self.insert_tags(unique_tags)
        
        # Process logos in batches
        logging.info(f"Processing {len(valid_logos)} logos...")
        for i in range(0, len(valid_logos), BATCH_SIZE):
            batch = valid_logos[i:i + BATCH_SIZE]
            logging.info(f"Processing batch {i//BATCH_SIZE + 1} of {(len(valid_logos)-1)//BATCH_SIZE + 1}")
            
            for logo in tqdm(batch, desc=f"Batch {i//BATCH_SIZE + 1}", leave=True):
                logo_id = self.process_logo(logo)
                if logo_id:
                    self.create_logo_tag_relations(logo_id, logo["tags"])

        logging.info("Migration completed!")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Migrate logo data to Supabase')
    parser.add_argument('--limit', type=int, help='Limit number of logos to process')
    args = parser.parse_args()

    migrator = LogoMigration()
    migrator.migrate('master_logo_details.json', limit=args.limit) 