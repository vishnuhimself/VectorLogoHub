export interface LogoData {
  url: string;
  title: string;
  logo_url: string;
  logo_alt: string;
  tags: string[];
  metadata: {
    url_path: string;
  };
  downloads?: number;
  likes?: number;
  about_brand?: string;
  about_logo?: string;
} 