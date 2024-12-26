# Discover F1
#### Video Demo:  <URL HERE>

## INDEX
|Headings|
|---|
| [Description](#Description:)|
| [Design](#design)|
| [Tools / Software used](#tools)|
| [Resources](#resources)|
| [app.py](#app)|
| &emsp;&emsp;["/" route](#index_route)|
| &emsp;&emsp;["/tracks" route](#tracks)|
| &emsp;&emsp;["/track/\<int:id\>/" route](#index)|
| [Templates](#templates)|
| &emsp;&emsp;[layout.html](#layout.html)|
| &emsp;&emsp;[index.html](#index.html)|
| &emsp;&emsp;[tracks.html](#tracks.html)|
| &emsp;&emsp;[track.html](#track.html)|
| [static](#static)|

## Description:

This website is designed to help newcomers to Formula 1 navigate the overwhelming sea of information that often greets those who are just starting to explore the sport. Formula 1 is renowned for its depth, blending high-octane racing with intricate strategies and cutting-edge engineering. While this complexity is a big part of what makes the sport fascinating to dedicated fans, it can be intimidating for casual viewers who simply want to enjoy the thrill of the race without diving headfirst into the more technical aspects.

The goal here is to break down those barriers by presenting the essentials in an accessible, engaging way, giving new fans a solid foundation to appreciate and enjoy Formula 1. Whether it’s understanding the basics of the race format, getting to know the teams and drivers, or discovering the history and iconic moments that have shaped the sport, this website offers a starting point that doesn’t require an engineering degree to appreciate.

By focusing on the excitement, the rivalries, and the human stories that unfold on and off the track, the aim is to create a gateway for anyone curious about Formula 1. From there, if you decide to explore the more technical side of things, you’ll have the knowledge and confidence to do so. But for now, the content is kept simple, exciting, and fun—because at its core, that’s what Formula 1 is all about.

The SQL back-end database displays facts about all current tracks on the F1 calendar for 2025. Each page only shows the necessary amount of information to enjoy the upcoming race without feeling lost to the historical importance of a given race or any notable areas on the track where overtaking is common.

### <a name="tools">Tools / Websites I used</a>
| Tool | Purpose |
| ---- | ------- |
| [Figma](https://www.figma.com) | Design of graphics and prototyping|
| [Pexels](https://www.pexels.com/) | Royalty-free images |
| [Font Awesome](https://fontawesome.com/) | Free icon library |
| [Todoist](https://todoist.com/) | Task management |
| [Typescale](https://typescale.com/) | Using perfect fourth ratio for font-sizing|
| [Brandfetch](https://brandfetch.com/) | Matching the colours of the official brand|

### <a name="resources">Resources</a>
| Site | Info |
| ---- | ------- |
| [Formula 1](https://www.formula1.com/) | Offical Formula 1 website for up to dat track statistics |
| [Stats F1](https://www.statsf1.com/en/circuits.aspx) | For any other additional info about a track |
| [Formula 1 Tickets](https://tickets.formula1.com/en) | Used to retrieve some assets like track svgs and country flags |

<br/>
<br/>
<br/>
<br/>
<br/>


# <a name="design">Design Decisions</a>

From the outset, I wanted to have a modern look to the website, so I opted to go for a dark colour background to match with modern design trends.
I used *Typescale* to get the right difference in font sizes between the different heading tags. I decided on using the perfect fourth scale. This meant the headings didn't get too large and unweildy on smaller screen sizes like mobile.
I used *Brandfetch* to get the colours from their website to make the website feel familiar to the user if they have already visited [https://www.formula1.com](https://www.formula1.com).
I settled on the colours:
- Primary colour: `#E10600`
- Text colour: `#FCFCFC`
- Background colour: `#15151E`


# Code Breakdown

## <a name="app">**app.py**</a>

#### Routes
- `/`
- `/tracks`
- `/track/<int:id>/`
- `@app.errorhandler(Exception)`

#### formatDate()

This function makes a human readable date from two separate dates.
Two dates like 2024-12-21 and 2024-12-23 will be converted to `21 - 23 Dec`. I had to read the `datetime` python library documentation to use this effectively.

#### <a name="index_route">@app.route("/")</a>
This route simply returns the `index.html` file in the **`/templates`** folder.

#### <a name="tracks">@app.route("/tracks")</a>
The "/tracks" route serves the purpose of displaying a list of Formula 1 tracks for the 2025 calendar in a visually organized grid layout (using `display: grid;`). This list is dynamically retrieved from the `formula.db` database and specifically draws data from the `tracks` and `track_info` tables. The inclusion of both tables allows users to filter and sort the track list according to their preferences, enhancing the functionality and interactivity of the feature.

User preferences for filtering and sorting are provided through the `#trackForm` form, which sends a **GET** request to the "/tracks" route. The request appends the form inputs to the URL as query parameters. These inputs are then used to construct the SQL query dynamically by concatenating query strings based on the criteria selected by the user. The construction of the query involves unpacking variables (*using `*params`*) to pass them securely to the database execution function.

The initial query selects all tracks and joins the `tracks` and `track_info` tables. Depending on user input, additional `WHERE` clauses are appended to filter by region, track type, or search terms (matching against columns like country, track name, city, or the official name of the grand prix). If sorting parameters are not provided, the query defaults to ordering by the start date of events.


```python
@app.route("/tracks")
def tracks():
    # retrieve the response of the form
    region = request.args.get("region")
    trackType = request.args.get("trackType")
    searchBox = request.args.get("searchBox")
    # generate the values for the select boxes
    regionList = db.execute("SELECT DISTINCT region FROM tracks ORDER BY region ASC")
    trackTypeList = db.execute("SELECT DISTINCT track_type FROM tracks ORDER BY track_type ASC")
    # this 2-dimenstional list provides the page with values for the value="" and innerText of eact sort option.
    sortList = [["first_appearance","First year in F1"],["grand_prix","No. of Grand Prix"],["length_km","Lap length"],["laps","No. of laps"]]
    # base SQL query
    query = "SELECT * FROM tracks JOIN track_info ON id=track_id WHERE 1=1"
    params = []
    #Dynamically append strings based on the existence of form inputs.
    if region:
        query += " AND region = ?"
        params.append(region)
    if trackType:
        query += " AND track_type = ?"
        params.append(trackType)
    if searchBox and searchBox.strip() != "":
        query += " AND (country LIKE ? OR track_name LIKE ? OR city LIKE ? OR official_name LIKE ?)"
        params.append(f"%{searchBox}%")
        params.append(f"%{searchBox}%")
        params.append(f"%{searchBox}%")
        params.append(f"%{searchBox}%")

    sort = request.args.get("sort")
    order = request.args.get("order")
    # Sets the default values of the sort and order select boxes
    if sort == None or order == None:
        query += " ORDER BY start_date ASC"
    else:
        query += f" ORDER BY {sort} {order}"
    tracks = db.execute(query,*params)
```
##### Filtering
The user can filter by:
- Region
- Type of Track (Is is a street circuit or a permanent one)
- A search box which looks at:
    - `city` = City of origin, eg. Silverstone
    - `track_name` = The name of the track, eg. Albert Park
    - `country` = The country of origin, eg. Austria
    - `official_name` = The official name of the Grand Prix, eg. FORMULA 1 GRAND PRIX DE MONACO 2025

##### Sorting
The user can sort by:
- Date
- First year in F1
- Number of Grand Prix held at the track
- The length of the circuit
- Number of laps

*The user can sort by any of these categories Ascending OR Descending via 2 select boxes*.
### <a name="track">@app.route("/track/\<int:id\>/")</a>
This route returns `track.html` with the placeholders in the template being replaced with the relevant information of the track based on the `<int:id>` that was passed into the url. It also queries the `winners` SQL table to find the most recent winning drivers at this track.
```python
@app.route("/track/<int:id>/")
def goToTrack(id):
    track = db.execute("SELECT * FROM tracks JOIN track_info ON id=track_id WHERE id = ?",id)[0]
    intro = track["intro"].split("\n\n")
    winners = db.execute("SELECT * FROM winners WHERE track_id = ?",id)
    track["svg_path"] = f'SVG_TRACKS/track_{id}.html'
    return render_template(
        "track.html",
        track=track,
        winners=winners,
        intro=intro
        )
```

## <a name="templates">**/templates**</a>

### <a name="layout.html">layout.html</a>
This is the central template file that jinja will use for all pages in this project.
```jinja
{% extends "layout.html" %}
{% block body %}
<!-- Insert html here -->
{% endblock %}
```

### <a name="index.html">index.html</a>
To break down the components of the project, I will start with the index page linked to the "/" flask route. This webpage displays the headings for questions that many new F1 fans might have, such as what is a *Sprint Race* and how does it differ from a normal race weekend, *how many points* are given at the end of the race, etc. The images can also be clicked on on larger screen sizes to open up a modal window. This was achieved by utilising code from the publicly available code from [Lightbox2](https://lokeshdhakar.com/projects/lightbox2/). I added my own javascript to the provided code to disable the modal window if the width was *smaller than 768px*:
```javascript
function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    const overlay = document.querySelector('.lightboxOverlay');
    const body = document.body;

    if (window.innerWidth < 768 && lightbox && overlay) {
        if (lightbox.style.display !== 'none') {
            lightbox.style.display = 'none'; // Hides the Lightbox
            overlay.style.display = 'none'; // Hides the overlay
            body.classList.remove('lb-disable-scrolling'); // Re-enables scrolling
        }
    }
}
```
Some of this code was analysed using ChatGPT, but all I used it for was to find out which classes and elements to remove to override the existing css from Lightbox2.

### <a name="tracks.html">tracks.html</a>

This file styles the page which shows the users the list of tracks. It uses `display:grid;` to create dynamic columns.



### <a name="track.html">track.html</a>

I had to look into the documentation of jinja2 to achieve what I wanted with the **/track/\<int:id\>/** route. By passing in the `id` variable to the route, a user will see the url as **/track/1/** if they are looking at the track with the id of 1. If the user enters the url manually and makes a mistake or mis-spelling, the user with be re-directed to **error.html** which uses flasks in-built errorHandler. I learned about the error handler from [GeeksforGeeks](https://www.geeksforgeeks.org/python-404-error-handling-in-flask/). It has since been modified to accept any error.
```python
@app.errorhandler(Exception)
def error(e):
    return render_template("error.html",error=e)
```
The actual content of the page will show the user around 3 paragraphs of information about the current track, then below that there is a embedded google map link to show the area around the track. In a column to the right, there is a list of key details like track length, fastest lap, and the names of the most recent winners on that track. The layout will change to a 1 column layout on smaller screen sizes.



### **/SVG_TRACKS**

This folder within **`/templates`** stores all of the svg snippets for the tracks. They are named as `track_{{ track_id }}.html`, so they will easily correspond to the track's id.

---
## <a name="static">**/static**</a>
### **/static/css**

#### fonts.css
This `.css` file adds the installed `Formula-1` font stored in **`/static/fonts/`** as well as define sizing of the headings.
```css
:root {
    --h1-size: 5.61rem;
    --h2-size: 4.209rem;
    --h3-size: 3.157rem;
    --h4-size: 2.369rem;
    --h5-size: 1.777rem;
    --h6-size: 1.333rem;
    --small-size: 0.75rem;
}
```

#### index.css

This file styles the "/" route at `index.html`.

#### lightbox.min.css

This file was downloaded as part of the *Lightbox2* plugin.

#### main_styles.css

This file sets the global variables for things like buttons, select boxes, colors and font sizes. This means that minimal styling is duplicated across pages with similar layouts.
```css
:root {
    font-size:18px;
    --scroll-btn-height: 3rem;
    --color-light: rgb(252,252,252);
    --color-dark: rgb(21,21,30);
    --primary: rgb(225,6,0);
    --primary-hover: rgb(173,6,0);
}
```

#### track_page.css

Contains the styling of the template track file.

#### tracks.css

Contains the styling of the `/tracks` route. This includes the styling for the list of tracks and the form on that page.

---
### **/static/images**

#### **/flags**

Contains all of the flags that belong to each track. In `.avif`.

#### **/lightbox**

4 images downloaded as part of the *Lightbox2* plugin to add the next,previous, close and loading images.

#### **/team_logos**

The files for each of the Formula 1 team's logos. In `.avif`.


#### **/TRACK_IMAGES**

This folder contains the images for backgrounds and hero images that need to be replicated.


#### upload.png
A free icon to show on the `#scrollToTop` button on each page.


---
### **/static/js**

#### lightbox-plus-jquery.min.js
This file was downloaded as part of the *Lightbox2* plugin. This file also bundles **jQuery** into the project.

#### loader.js

This script usese the `window.onload` method to ensure all media is loaded, then hides the loading animation overlay.

```javascript
window.onload = function() {
    const main = document.querySelector("main");
    const loader = document.getElementById("loader");
    loader.style.visibility = "hidden";  // Hide the loader
    document.documentElement.style.overflow = "auto";  // Enable scrolling
    main.style.visibility = "visible";
};
```

#### scroll.js

This file's purpose is to show the `#scrollToTop` button when the user isn't at the top of the page. It also takes into account the difference between Firefox,Chrome and Safari.
```javascript
if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20 ){
    btn.style.zIndex = 99;
    btn.style.opacity = "1";

} else {
    btn.style.zIndex = -50;
    btn.style.opacity = "0";

}
```

#### showTeams.js

This file shows toggles the display of the `#team-grid` element on the **`/`** route.
It also flips the icon on the button to show the grid.

#### tracks.js

This file shows the clear button beside any of the fields that have data in them in the form on `/tracks`.
It also uses `localStorage` to store the position the user has scrolled from the top. It also has code to prevent a text box from submitting the form.
```javascript
const region = [
    document.getElementById("regionFilter"),
    document.getElementById("regionButton")
    ];
const search = [
    document.getElementById("searchBox"),
    document.getElementById("searchButton")
    ];
const type = [
    document.getElementById("typeFilter"),
    document.getElementById("typeButton")
    ];
```
## requirements.txt

This file was auto-generated using:
```bash
pip freeze > requirements.txt
```
