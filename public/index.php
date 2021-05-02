<?php

$credentials = json_decode(file_get_contents(__DIR__ . '/../credentials.json'), true);
$edit = empty($_GET) || isset($_GET['edit']);

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sheet Viewer</title>
    <link rel="stylesheet" href="assets/index.css"/>
    <?php
        if ($edit) {
            echo '<link rel="stylesheet" href="assets/form.css"/>';
        }
        if (!empty($_GET['css'])) {
            echo "<link rel=\"stylesheet\" href=\"{$_GET['css']}\"/>";
        }
    ?>
    <script src="assets/index.js"></script>
</head>
<body onload="onLoad()">

<?php if ($edit) { ?>
<div class="golden-center" id="body">
    <div>
        <h1>Sheet Viewer</h1>

        <form method="get" class="form">
            <div class="control-group">
                <label for="title">Title</label>
                <input id="title" name="title" type="text" value="<?= $_GET['title'] ?>"/>
            </div>

            <div class="control-group">
                <label for="sheet">Google Sheet ID</label>
                <input id="sheet" name="sheet" type="text" value="<?= $_GET['sheet'] ?>"/>
                <small class="help">Make sure that you give <a id="a" href="mailto:<?= $credentials['client_email'] ?>"><?= $credentials['client_email'] ?></a> read-only access to this
                    sheet.</small>
            </div>

            <div class="control-group">
                <label for="range">Range</label>
                <input id="range" name="range" type="text" value="<?= $_GET['range'] ?>"/>
            </div>

            <div class="control-group">
                <label for="tags">Columns Containing Tags</label>
                <div id="tags">
                    <?php
                    $tags = array_filter($_GET['tags'], function ($elt) {
                        return strlen($elt) > 0;
                    });
                    if (!empty($tags)) {
                        foreach ($tags as $name) {
                            echo "<input name=\"tags[]\" type=\"text\" value=\"{$name}\"/>";
                        }
                    } else {
                        echo '<input name="tags[]" type="text"/>';
                    }
                    ?>
                    <button id="add" onclick="addTagsColumn()" type="button">Add Another Tags Column</button>
                </div>
            </div>

            <div class="control-group">
                <?php $format = $_GET['format']; ?>
                <label for="format">Format</label>
                <textarea
                    id="format"
                    name="format"
                    rows="<?= $format ?  substr_count($format, "\n") + 2 : 3?>"
                ><?= $format ?></textarea>
                <small class="help">Valid HTML, using <code>{Column Name}</code> for field placeholders.</small>
            </div>

            <div class="control-group">
                <label for="css">Custom CSS URL</label>
                <input id="css" name="css" type="text" value="<?= $_GET['css'] ?>"/>
            </div>

            <div class="control-group">
                <button type="submit">Go</button>
            </div>

        </form>
    </div>
</div>
<?php } else { echo '<div id="body"><h1>Loading&hellip;</h1></div>'; }?>

</body>
</html>
