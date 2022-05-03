$(document).ready(() => {
    setTimeout(() => {
        $('main').css('opacity', 1);

        setTimeout(() => {
            $('#sec_Start').css('opacity', 1);
        }, 1500)
    }, 1500)
});

$("#btn_Start").on('click', () => {
    $('#sec_Start').css('opacity', '0');

    setTimeout(() => {
        $('#sec_Start').hide();
        $('#sec_Planetas').css('display', 'flex');

        setTimeout(() => {
            $('#sec_Planetas').css('opacity', '1');
        }, 200);
    }, 800
    )
});

$(".pln_button").on('click', (e) => {
    let planetaId = e.currentTarget.id;

    let formData = new FormData();

    formData.append('planeta', planetaId);

    $.ajax({
        type: "POST",
        url: "../controller/getPlanetaInfo.php",
        data: formData,
        processData: false,
        contentType: false
    }).done((resultado) => {
        let planeta = JSON.parse(resultado);

        $('#sec_Planetas').css('opacity', '0');

        setTimeout(() => {
            $('#sec_Planetas').css('display', 'none');

            $("#pinf_Img").attr('src', planeta['img']);
            $("#pinf_Titulo").html(planeta['titulo']);
            $("#pinf_Subtitulo").html(planeta['subtitulo']);
            $("#pinf_Texto").html(planeta['texto']);

            $('#sec_PlanetaInfo').css('display', 'flex');

            setTimeout(() => {
                $('#sec_PlanetaInfo').css('opacity', '1');
            }, 200);
        }, 800);
    });
});

$('#btn_voltar').on('click', () => {
    $('#sec_PlanetaInfo').css('opacity', '0');

    setTimeout(() => {
        $('#sec_PlanetaInfo').css('display', 'none');
        $('#sec_Planetas').css('display', 'flex');

        setTimeout(() => {
            $('#sec_Planetas').css('opacity', '1');
        }, 200)
    }, 800);
})