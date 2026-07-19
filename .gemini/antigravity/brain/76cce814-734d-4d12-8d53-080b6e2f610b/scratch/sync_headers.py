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

        start_marker = '<header data-header'
        end_marker = '</header>'

        start_idx = content.find(start_marker)
        end_idx = content.find(end_marker)

        if start_idx != -1 and end_idx != -1:
            replaced_content = content[:start_idx] + new_header + content[end_idx + len(end_marker):]
            with open(filename, 'w') as f:
                f.write(replaced_content)
            print(f"Successfully synced header in {filename}")
        else:
            print(f"Warning: Header markers not found in {filename}")

if __name__ == "__main__":
    sync_headers()
