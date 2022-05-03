<?php
    include('../model/planetas.php');

    $planeta = new Planeta();

    $planeta -> setPlanetaInfo($_POST['planeta']);

    echo json_encode($planeta -> getPlanetaInfo());
?>