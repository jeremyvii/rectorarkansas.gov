module Jekyll
  class PostCompileCommand < Jekyll::Generator
    safe true
    priority :lowest

    def generate(site)
      Jekyll::Hooks.register :site, :post_write do |site|
        command = "node scripts/index-ordinances.mjs"
        puts "Running post-compile command: #{command}"
        system(command)
      end
    end
  end
end