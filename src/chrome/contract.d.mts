export declare const CHROME_CONTRACT: 'v1';
export declare const ASSET_TOKEN: '%IG_CHROME_ASSETS%';

export interface ParsedFragment {
  contract: string;
  build: string;
  head: string;
  header: string;
  footer: string;
}

export declare function parseFragment(html: string): ParsedFragment;
