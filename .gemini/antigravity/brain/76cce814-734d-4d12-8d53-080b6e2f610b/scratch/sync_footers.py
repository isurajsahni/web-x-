import os
import re

def sync_footers():
    # 1. Read the footer from index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        index_content = f.read()

    # Find the footer block in index.html
    footer_match = re.search(r'(<!-- ============ FOOTER ============ -->.*?</footer>)', index_content, re.DOTALL)
    if not footer_match:
        print("Error: Footer block not found in index.html")
        return

    footer_content = footer_match.group(1)
    print("Found footer in index.html. Length:", len(footer_content))

    # 2. Find all HTML files
    html_files = []
    for root, dirs, files in os.walk('.'):
        # Skip node_modules and git
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith('.html') and file != 'index.html':
                html_files.append(os.path.join(root, file))

    print(f"Found {len(html_files)} other HTML files to sync: {html_files}")

    # 3. Replace footer in each file
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Let's search for the footer block.
        # It could start with a footer comment or just <footer
        footer_pat = re.compile(r'(<!-- ============ FOOTER ============ -->.*?</footer>|<footer.*?</footer>)', re.DOTALL)
        
        if footer_pat.search(content):
            new_content = footer_pat.sub(footer_content, content)
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Successfully synced footer in {html_file}")
        else:
            print(f"Warning: No footer match found in {html_file}")

if __name__ == '__main__':
    sync_footers()
