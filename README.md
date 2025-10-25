# UnitedTales - Collaborative Story Writing Platform

A full-featured collaborative story writing platform built with Flask, HTML, CSS, and vanilla JavaScript. Users can start stories, contribute to others' stories, and manage the collaborative writing process.

## Features

### Core Functionality

- **User Authentication**: Secure registration and login system
- **User Preferences**: Users specify their writing strengths (start, end, plot, twist) and favorite genres
- **Story Management**: Create, edit, and manage collaborative stories
- **Contribution System**: Users can contribute to any story with approval workflow
- **Admin Panel**: Comprehensive admin interface for site management

### User Experience

- **Responsive Design**: Fully responsive across all devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Interactive Features**: Real-time form validation, auto-save, and keyboard shortcuts
- **Mobile-First**: Optimized for mobile devices with hamburger navigation

### Story Collaboration

- **Story Creation**: Start new stories with genre classification
- **Contribution Approval**: Story owners approve/reject contributions
- **Genre-Based Discovery**: Browse stories by genre and search functionality
- **Writing Strengths Matching**: System matches users based on their writing preferences

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cursor_site
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**

   ```bash
   python app.py
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
cursor_site/
├── app.py                 # Main Flask application
├── requirements.txt      # Python dependencies
├── README.md            # Project documentation
├── templates/           # HTML templates
│   ├── base.html       # Base template with navigation
│   ├── index.html       # Homepage
│   ├── register.html    # User registration
│   ├── login.html       # User login
│   ├── user_preferences.html # User preference setup
│   ├── dashboard.html   # User dashboard
│   ├── create_story.html # Story creation form
│   ├── story_detail.html # Individual story view
│   ├── browse.html      # Story browsing
│   └── admin.html       # Admin panel
├── static/             # Static assets
│   ├── css/
│   │   └── style.css   # Main stylesheet
│   ├── js/
│   │   └── main.js     # JavaScript functionality
│   └── images/         # Image assets
└── story_collab.db     # SQLite database (created automatically)
```

## Key Features Explained

### User Registration & Preferences

- New users are prompted to select their writing strength (start, end, plot, twist)
- Users choose their favorite genre from 8 available options
- This data helps match users with appropriate stories

### Story Collaboration Workflow

1. **Story Creation**: Users create stories with titles, genres, and initial content
2. **Contribution**: Other users can contribute continuations to any story
3. **Approval Process**: Story owners review and approve/reject contributions
4. **Story Evolution**: Approved contributions are added to the main story

### Admin Panel

- View all users, stories, and contributions
- Monitor site activity and statistics
- Access comprehensive data tables

### Responsive Design

- Mobile-first approach with hamburger navigation
- Flexible grid layouts that adapt to screen size
- Touch-friendly interface elements
- Optimized typography and spacing

## Database Schema

### Users Table

- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Hashed password
- `is_admin`: Admin privileges flag
- `writing_strength`: User's writing preference
- `favorite_genre`: User's preferred genre

### Stories Table

- `id`: Primary key
- `title`: Story title
- `content`: Story content
- `genre`: Story genre
- `status`: Story status (active, completed, archived)
- `author_id`: Foreign key to Users
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Contributions Table

- `id`: Primary key
- `content`: Contribution content
- `contributor_id`: Foreign key to Users
- `story_id`: Foreign key to Stories
- `status`: Approval status (pending, approved, rejected)
- `created_at`: Creation timestamp

## Customization

### Adding New Genres

Edit the genre options in:

- `templates/create_story.html` (create story form)
- `templates/user_preferences.html` (user preferences)
- `app.py` (browse filtering)

### Styling Customization

- Main styles: `static/css/style.css`
- Color scheme: Update CSS custom properties
- Typography: Modify font imports and styles
- Layout: Adjust grid and flexbox properties

### Adding Features

- New routes: Add to `app.py`
- New templates: Create in `templates/`
- JavaScript: Extend `static/js/main.js`
- Database: Add models to `app.py`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features

- Password hashing with Werkzeug
- Session management
- CSRF protection (can be added)
- Input validation and sanitization
- SQL injection prevention via ORM

## Performance Optimizations

- Responsive images with lazy loading
- CSS and JS minification ready
- Database query optimization
- Efficient template rendering
- Mobile-first responsive design

## Future Enhancements

- Real-time notifications
- Advanced search and filtering
- Story analytics and insights
- User profiles and social features
- Export stories to various formats
- Advanced admin controls
- API endpoints for mobile apps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or support, please open an issue in the repository or contact the development team.
