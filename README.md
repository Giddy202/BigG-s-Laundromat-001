# BigG's Laundromat - Professional Laundry Services

A modern, responsive website for BigG's Laundromat featuring professional laundry and cleaning services.

## 🚀 Features

- **Modern Responsive Design** - Works perfectly on all devices
- **Service Pages** - Dedicated pages for different services
- **Shopping Cart** - Interactive cart with draggable functionality
- **Service Worker** - Offline functionality and caching
- **Admin Panel** - "The Panel" navigation for admin access
- **Smooth Animations** - Beautiful CSS animations and transitions
- **Professional UI/UX** - Clean, modern interface

## 📁 Project Structure

```
BigGs-Laundromat/
├── public/                 # Main website files
│   ├── assets/
│   │   ├── css/           # Stylesheets
│   │   ├── js/            # JavaScript files
│   │   └── images/        # Images and assets
│   ├── index.html         # Home page
│   ├── laundry.html       # Laundry services page
│   ├── upholstery.html    # Upholstery services page
│   ├── hotels.html        # Hotels & office services page
│   ├── auto.html          # Auto detailing page
│   └── sw.js             # Service worker
├── helpers/               # PHP backend helpers
│   └── functions.php      # Database and utility functions
└── README.md             # This file
```

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Bootstrap 5, Custom CSS
- **Backend**: PHP
- **Database**: MySQL (via PHP helpers)
- **Caching**: Service Worker API
- **Icons**: Font Awesome

## 🚀 Getting Started

### Prerequisites
- Web server (Apache/Nginx) or local development server
- PHP 7.4+ (for backend functionality)
- MySQL database (for data storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/biggs-laundromat.git
   cd biggs-laundromat
   ```

2. **Set up web server**
   - Place the `public` folder in your web server's document root
   - Configure PHP to handle the backend files

3. **Database setup**
   - Import the database schema (if provided)
   - Update database credentials in `helpers/functions.php`

4. **Start development server**
   ```bash
   # Using Python
   cd public
   python -m http.server 8000
   
   # Or using PHP
   php -S localhost:8000
   ```

5. **Access the website**
   - Open `http://localhost:8000` in your browser

## 📱 Pages

- **Home** (`/`) - Main landing page with service overview
- **Laundry & Dry Cleaning** (`/laundry.html`) - Laundry services
- **Home & Upholstery** (`/upholstery.html`) - Upholstery cleaning
- **Hotels & Office** (`/hotels.html`) - Commercial services
- **Auto Detailing** (`/auto.html`) - Vehicle cleaning services

## 🛒 Features

### Shopping Cart
- Draggable cart icon
- Add/remove items
- Quantity management
- Persistent storage (localStorage)

### Service Worker
- Offline functionality
- Asset caching
- Performance optimization

### Admin Panel
- "The Panel" navigation button
- Admin access control
- Management interface

## 🎨 Customization

### Colors
The project uses CSS custom properties for easy theming:
```css
:root {
    --royal-blue: #1E3A8A;
    --fresh-green: #16A34A;
    --warm-gold: #FACC15;
    --light-blue: #3B82F6;
}
```

### Adding New Services
1. Add service data to `assets/js/main.js`
2. Create service page HTML
3. Update navigation menus
4. Add service-specific CSS if needed

## 🐛 Debugging

### Service Worker Issues
- Use `sw-manager.html` to manage service worker
- Clear caches if needed
- Check browser console for errors

### Image Loading Issues
- Use `debug-images.html` to test image loading
- Check file paths and permissions
- Verify server configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@biggslaundromat.com or create an issue in this repository.

## 🙏 Acknowledgments

- Bootstrap for the responsive framework
- Font Awesome for the icons
- All contributors and testers

---

**BigG's Laundromat** - Professional cleaning services for every need! 🧺✨