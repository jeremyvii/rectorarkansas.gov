module Jekyll
  module PrepareTelUriFilter
    def prepare_tel_uri(input)
      return input unless input.is_a?(String)
      # Remove all non-numeric characters and prepend 'tel:'
      "tel:#{input.gsub(/\D/, '')}"
    end
  end
end

Liquid::Template.register_filter(Jekyll::PrepareTelUriFilter)
