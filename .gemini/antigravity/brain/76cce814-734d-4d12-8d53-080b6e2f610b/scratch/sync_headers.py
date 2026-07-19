import os

def sync_headers():
    # Load the new header HTML block
    with open('/tmp/new_header.html', 'r') as f:
        new_header = f.read()

    # List of files to sync
    html_files = [
        "404.html",
        "blog-choosing-web-design-agency.html",
        "blog-core-web-vitals.html",
        "blog-landing-page-vs-website.html",
        "blog-website-cost.html",
        "blog.html",
        "case-study-erp.html",
        "case-study-gpsfdk.html",
        "case-study-nova-finance.html",
        "case-study-rightway.html",
        "contact.html",
        "studio.html",
        "work.html"
    ]

    for filename in html_files:
        if not os.path.exists(filename):
            print(f"File {filename} does not exist, skipping.")
            continue

        with open(filename, 'r') as f:
            content = f.read()

        # Search for the newly injected block
        start_marker = '<!-- ============ PREMIUM FLOATING GLASS NAVIGATION ============ -->'
        start_idx = content.find(start_marker)
        
        if start_idx != -1:
            # Find the closing </script> tag after this block
            end_marker = '</script>'
            end_idx = content.find(end_marker, start_idx)
            
            if end_idx != -1:
                replaced_content = content[:start_idx] + new_header + content[end_idx + len(end_marker):]
                with open(filename, 'w') as f:
                    f.write(replaced_content)
                print(f"Successfully synced centered header in {filename}")
            else:
                print(f"Error: end_marker not found in {filename}")
        else:
            # Fallback if the file still has the old header format
            fallback_start = '<header data-header'
            fallback_end = '</header>'
            fallback_start_idx = content.find(fallback_start)
            fallback_end_idx = content.find(fallback_end)
            
            if fallback_start_idx != -1 and fallback_end_idx != -1:
                replaced_content = content[:fallback_start_idx] + new_header + content[fallback_end_idx + len(fallback_end):]
                with open(filename, 'w') as f:
                    f.write(replaced_content)
                print(f"Successfully synced fallback header in {filename}")
            else:
                print(f"Critical error: No header markers found in {filename}")

if __name__ == "__main__":
    sync_headers()
