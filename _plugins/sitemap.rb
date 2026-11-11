module Jekyll
  class SitemapGenerator < Generator
    safe true
    priority :lowest

    def generate(site)
      documents = site.collections.values.select(&:write?).flat_map(&:docs)
      html_pages = site.pages.select(&:html?)
      html_documents = documents.select { |document| document.output_ext == ".html" }
      site.config["sitemap_urls"] = (html_pages + html_documents).select do |page|
        page.data["sitemap"] != false &&
          !noindex?(site, page)
      end.map(&:url).uniq.sort
    end

    private

    def noindex?(site, page)
      data = page.data
      visited = []
      loop do
        return true if data["noindex"]

        layout = data["layout"]
        return false if visited.include?(layout) || !site.layouts.key?(layout)

        visited << layout
        data = site.layouts[layout].data
      end
    end
  end
end
