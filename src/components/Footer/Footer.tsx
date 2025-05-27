import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ExternalLink
} from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    'About Us',
    'Contact',
    'Careers',
    'Press',
    'Blog',
    'Help Center'
  ];

  const categories = [
    'Stories',
    'Films',
    'Podcasts',
    'Animations',
    'Sneaks',
    'Featured'
  ];

  const legal = [
    'Privacy Policy',
    'Terms of Service',
    'Cookie Policy',
    'DMCA',
    'Community Guidelines'
  ];

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              _livelens
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Discover and share amazing stories, films, podcasts, and animations. 
              Your gateway to creative content that inspires and entertains.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-110 group"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-white group-hover:animate-pulse" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 inline-block group flex items-center"
                  >
                    {category}
                    <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Get in Touch</h3>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-300 text-sm">
                <Mail className="h-4 w-4 mr-2 text-purple-400" />
                hello@livelens.com
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Phone className="h-4 w-4 mr-2 text-purple-400" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                San Francisco, CA
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-200">Legal</h4>
              <ul className="space-y-1">
                {legal.slice(0, 3).map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-gray-300 transition-colors duration-200 text-xs"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-white/10 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-white mb-1">Stay Updated</h3>
              <p className="text-gray-300 text-sm">Get the latest content delivered to your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-700/50 border border-white/20 rounded-l-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1 md:w-64"
              />
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-2 rounded-r-full text-white font-medium transition-all duration-200 hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center text-gray-400 text-sm mb-4 md:mb-0">
              <span>© 2025 LiveLens. Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" />
              <span>in San Francisco</span>
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-xs text-gray-400">
              {legal.slice(3).map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-gray-300 transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;