# Sheet Viewer

Use a Google Sheet as data backend for interactive web page

### Install

  1. Store _not_ in the web server document root! (Prevent accidental access to credentials!
  2. Symlink `public` directory to web server document root.   
  3. `composer install`
  4. Configure a new project on the [Google Cloud Platform](https://console.cloud.google.com/apis/dashboard).
  5. Add a [Service Account](https://console.cloud.google.com/apis/credentials) to that project
  6. Download the service account credentials and store in project root as `credentials.json`

### Use

Just point your browser at this project and fill out the form.

Once you hit <kbd>Go</kbd> you'll get the sheet rendered (assuming you remembered to share the sheet with the service account). Use the resulting (long) URL as the 
link to share the web page (feel free to use a URL-shortener, natch).

If you want to edit your configuration after 
the fact, append `&edit` to the end of the URL... but note that changes made will generate a _new_ URL that will 
need to be reshared.
