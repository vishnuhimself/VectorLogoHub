import json
import logging
from typing import List, Set
from supabase import create_client
from tqdm import tqdm
from config import SUPABASE_URL, SUPABASE_KEY
from time import sleep
from random import uniform

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('recovery.log'),
        logging.StreamHandler()
    ]
)

class LogoRecovery:
    def __init__(self):
        self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.max_retries = 3
        self.base_delay = 2  # Longer base delay for recovery

    def extract_failed_logos(self) -> List[str]:
        """Extract failed logo titles from migration log."""
        failed_logos = set()
        try:
            with open('migration.log', 'r') as f:
                for line in f:
                    if 'ERROR - Error processing logo' in line:
                        # Extract logo title
                        title = line.split('Download ')[1].split(' vector')[0]
                        failed_logos.add(title)
        except Exception as e:
            logging.error(f"Error reading migration log: {str(e)}")
        
        return list(failed_logos)

    def find_logo_in_json(self, title: str, json_data: List[dict]) -> dict:
        """Find logo data by title in JSON file."""
        for logo in json_data:
            if logo["title"] == f"Download {title} vector (SVG) logo":
                return logo
        return None

    def with_retry(self, operation, *args):
        """Retry mechanism with exponential backoff."""
        for attempt in range(self.max_retries):
            try:
                return operation(*args)
            except Exception as e:
                if attempt < self.max_retries - 1:
                    delay = self.base_delay * (2 ** attempt) + uniform(0, 0.5)
                    logging.info(f"Retry attempt {attempt + 1}, waiting {delay:.1f}s...")
                    sleep(delay)
                    self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
                else:
                    raise

    def process_logo(self, logo: dict) -> bool:
        """Process a single logo with retries."""
        try:
            # Check if already exists
            def check_existing():
                return self.supabase.table('logos') \
                    .select('id') \
                    .eq('url_path', logo["metadata"]["url_path"]) \
                    .execute()

            result = self.with_retry(check_existing)
            if result.data and len(result.data) > 0:
                logging.info(f"Logo already exists: {logo['title']}")
                return True

            # Insert logo
            logo_data = {
                "title": logo["title"],
                "logo_url": logo["logo_url"].replace(
                    'cdn.worldvectorlogo.com/logos',
                    'cdn.vectorlogohub.com'
                ),
                "logo_alt": logo["logo_alt"],
                "url_path": logo["metadata"]["url_path"]
            }

            def insert_logo():
                return self.supabase.table('logos').insert(logo_data).execute()

            result = self.with_retry(insert_logo)
            logo_id = result.data[0]['id']

            # Process tags
            if logo["tags"]:
                for tag in logo["tags"]:
                    def process_tag():
                        # Get or create tag
                        tag_result = self.supabase.table('tags') \
                            .select('id') \
                            .eq('name', tag) \
                            .execute()
                        
                        if not tag_result.data:
                            tag_result = self.supabase.table('tags') \
                                .insert({"name": tag}) \
                                .execute()
                        
                        tag_id = tag_result.data[0]['id']
                        
                        # Create relationship
                        return self.supabase.table('logo_tags') \
                            .insert({
                                "logo_id": logo_id,
                                "tag_id": tag_id
                            }) \
                            .execute()

                    self.with_retry(process_tag)

            logging.info(f"Successfully recovered logo: {logo['title']}")
            return True

        except Exception as e:
            logging.error(f"Error recovering logo {logo['title']}: {str(e)}")
            return False

    def recover(self):
        """Main recovery process."""
        logging.info("Starting recovery process...")
        
        # Get failed logos
        failed_logos = self.extract_failed_logos()
        if not failed_logos:
            logging.info("No failed logos found in migration log")
            return

        logging.info(f"Found {len(failed_logos)} failed logos")

        # Load original JSON data
        try:
            with open('data/master_logo_details.json', 'r') as f:
                json_data = json.load(f)
        except Exception as e:
            logging.error(f"Error loading JSON file: {str(e)}")
            return

        # Process each failed logo
        success_count = 0
        for title in tqdm(failed_logos, desc="Recovering logos"):
            logo_data = self.find_logo_in_json(title, json_data)
            if logo_data:
                if self.process_logo(logo_data):
                    success_count += 1

        logging.info(f"Recovery completed. Successfully recovered {success_count}/{len(failed_logos)} logos")

if __name__ == "__main__":
    recovery = LogoRecovery()
    recovery.recover() 