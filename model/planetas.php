<?php
    class Planeta
    {
        protected $planetaInfo;
        public $planetas = [
            [
                "id" => "terra",
                "nome" => "Terra",
                "caminho" => "./img/terra.png"
            ],

            [
                "id" => "jupiter",
                "nome" => "Júpiter",
                "caminho" => "./img/jupiter.png"
            ],

            [
                "id" => "marte",
                "nome" => "Marte",
                "caminho" => "./img/marte.png"
            ],

            [
                "id" => "urano",
                "nome" => "Urano",
                "caminho" => "./img/urano.png"
            ]
        ];

        function setPlanetaInfo($planeta)
        {
            $thisPlaneta = array();

            if ($planeta == 'terra')
            {
                $thisPlaneta = [
                    "titulo" => "Terra",
                    "subtitulo" => "O planeta Terra é o planeta habitado por nós, seres vivos.",
                    "texto" => "A Terra é o terceiro planeta mais próximo do Sol, o mais denso e o quinto maior dos oito planetas do Sistema Solar. Conhecido também como planeta água, é o maior dentre os quatro planetas rochosos que fazem parte do Sistema Solar. É por vezes designada como Mundo ou Planeta Azul.",
                    "img" => "./img/terra.png"
                ];
            }

            if ($planeta == 'jupiter')
            {
                $thisPlaneta = [
                    "titulo" => "Júpiter",
                    "subtitulo" => "Júpiter é considerado o maior planeta do Sistema Solar, sendo rodeado de vários satélites naturais.",
                    "texto" => "Júpiter é o maior planeta do Sistema Solar, estando situado entre Marte e Saturno. Seu tamanho rende-lhe vários satélites naturais orbitando ao seu redor, cerca de 70. Durante a noite, esse planeta pode ser visto a olho nu, sendo a segunda estrela mais brilhante, atrás apenas de Vênus, o segundo planeta na ordem usando-se o Sol como referência.",
                    "img" => "./img/jupiter.png"
                ];
            }

            if ($planeta == 'marte')
            {
                $thisPlaneta = [
                    "titulo" => "Marte",
                    "subtitulo" => "Marte é o quarto planeta do Sistema Solar, ficando entre a Terra e Júpiter.",
                    "texto" => "Marte é um dos nove planetas do Sistema Solar. É o quarto a partir do Sol, estando localizado a uma distância de pouco mais de 227 milhões de quilômetros desse astro. O planeta Marte completa uma volta ao redor do próprio eixo em 24 horas e 37 minutos, ao passo que o movimento de translação demora 687 dias. Trata-se de um planeta terroso com uma fina atmosfera composta predominantemente por dióxido de carbono. Dispõe de duas luas: Phobos e Deimos.",                    
                    "img" => "./img/marte.png"
                ];
            }

            if ($planeta == 'urano')
            {
                $thisPlaneta = [
                    "titulo" => "Urano",
                    "subtitulo" => "Planeta Urano é um dos maiores do Sistema Solar, sendo o sétimo a partir do Sol. Dispõe de um sistema de anéis e é formado principalmente por gases e líquidos.",
                    "texto" => "O planeta Urano é o terceiro maior do Sistema Solar e está posicionado na sétima órbita a partir do Sol. Formado principalmente por gases e fluidos, Urano não possui uma superfície sólida como a Terra. Sua estrutura é composta, ainda, por sistemas de anéis que orbitam ao seu redor, os quais são menos brilhantes do que os de outros planetas, como Saturno. Ao todo, Urano possui 27 luas conhecidas. Apenas uma sonda espacial visitou o planeta, sendo a maior parte das descobertas ao seu respeito feita com o auxílio de telescópios.",
                    "img" => "./img/urano.png"
                ];
            }

            if (count($thisPlaneta) > 0)
            {
                $this -> planetaInfo = $thisPlaneta;
            }
        }

        function getPlanetaInfo()
        {
            return $this -> planetaInfo;
        }
    }
?>