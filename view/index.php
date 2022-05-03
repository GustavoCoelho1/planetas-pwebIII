<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EspaçoX</title>

    <link rel="stylesheet" href="css/index.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
</head>
<body>
    <main>
        <?php
            include('../model/planetas.php');

            $p = new Planeta();
        ?>  

        <section id="sec_Start" class="sec_start">
            <span class="str_titulo">Bem-vindo!</span>
            <button id="btn_Start" class="str_button">
                <img src="img/espaco.png" alt="">
                <span>Começar</span>
            </button>
        </section>

        <section id="sec_Planetas" class="sec_planetas">
            <?php
                foreach($p -> planetas as $planeta)
                {?>
                    <button id="<?=$planeta['id']?>" class="pln_button">
                        <img src="<?=$planeta['caminho']?>" alt="">
                        <span><?=$planeta['nome']?></span>
                    </button>
                <?php
                }
            ?>
        </section>

        <section id="sec_PlanetaInfo" class="sec_planetaInfo">
            <ion-icon id="btn_voltar" name="chevron-back-outline"></ion-icon>
            <h1 id="pinf_Titulo" class="pinf_titulo"></h1>    
            <img id="pinf_Img" class="pinf_img">
            <h3 id="pinf_Subtitulo" class="pinf_subtitulo"></h3>
            <span id="pinf_Texto" class="pinf_texto"></span>
        </section>
    </main>
</body>

<script src="js/index.js"></script>
<script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>

</html>