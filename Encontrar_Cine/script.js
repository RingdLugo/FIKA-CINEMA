

const datos = {
    cdmx: {
        "Ciudad de México": [
            "FIKA Plaza PeriSur",
            "FIKA Reforma 222",
            "FIKA Parque Delta"
        ]
    },
    jalisco: {
        "Guadalajara": [
            "FIKA Andares",
            "FIKA Galerías Guadalajara"
        ],
        "Zapopan": [
            "FIKA Plaza Patria"
        ]
    },
    nuevoleon: {
        "Monterrey": [
            "FIKA Paseo La Fe",
            "FIKA Galerías Monterrey"
        ]
    },
    edomex: {
        "Toluca": [
            "FIKA Galerías Toluca"
        ],
        "Naucalpan": [
            "FIKA Satélite"
        ]
    },
    puebla: {
        "Puebla": [
            "FIKA Angelópolis",
            "FIKA Explanada Puebla"
        ]
    }
};

const estadoSelect = document.getElementById("estado");
const ciudadSelect = document.getElementById("ciudad");
const cineSelect = document.getElementById("cine");

estadoSelect.addEventListener("change", function(){

    ciudadSelect.innerHTML = '<option value="">Selecciona una ciudad</option>';
    cineSelect.innerHTML = '<option value="">Selecciona un cine</option>';

    cineSelect.disabled = true;

    if(this.value !== ""){
        ciudadSelect.disabled = false;

        const ciudades = datos[this.value];

        for(let ciudad in ciudades){
            let option = document.createElement("option");
            option.value = ciudad;
            option.textContent = ciudad;
            ciudadSelect.appendChild(option);
        }

    } else {
        ciudadSelect.disabled = true;
    }
});

ciudadSelect.addEventListener("change", function(){

    cineSelect.innerHTML = '<option value="">Selecciona un cine</option>';

    if(this.value !== ""){
        cineSelect.disabled = false;

        const estado = estadoSelect.value;
        const cines = datos[estado][this.value];

        cines.forEach(cine => {
            let option = document.createElement("option");
            option.value = cine;
            option.textContent = cine;
            cineSelect.appendChild(option);
        });

    } else {
        cineSelect.disabled = true;
    }
});

const btnEncontrar = document.getElementById("btnEncontrar");
const resultado = document.getElementById("resultado");

btnEncontrar.addEventListener("click", function(){

    const estado = estadoSelect.value;
    const ciudad = ciudadSelect.value;
    const cine = cineSelect.value;

    if(estado === "" || ciudad === "" || cine === ""){
        resultado.innerHTML = "<p class='mensaje'>Por favor selecciona estado, ciudad y cine.</p>";
        return;
    }

    resultado.innerHTML = `
        <p class="mensaje">Has seleccionado: ${cine}</p>
        <button class="btn-secundario" id="verHorarios">Ver horarios</button>
    `;

});

