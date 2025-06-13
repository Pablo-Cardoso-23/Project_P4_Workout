async function loadTreinos() {
    
    try {

        const response = await fetch('/api/treinos', {

            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Erro ao carregar treinos:', response.statusText);
            return;
        }

        const treinos = await response.json();
        console.log('Treinos carregados:', treinos);
        const listaTreinos = document.getElementById("listaTreinos");

        listaTreinos.innerHTML = '';

        treinos.forEach(treino => {
            
            const li = document.createElement('li');
            li.className = 'treino-item';
            li.dataset.id = treino.id;
            li.innerHTML = `<span>${treino.name}</span> <button class="remove-treino-btn">X</button>`;
            listaTreinos.appendChild(li);

        });

    } catch (error) {
        console.error('Erro no loadTreinos:', error);
    }
}

async function loadExercicios(planId) {
    
    try {

        const response = await fetch(`/api/exercicios?planId=${planId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Erro ao carregar exercícios:', response.statusText);
            return;
        }

        const exercicios = await response.json();
        const listaExercicios = document.getElementById("listaExercicios");

        listaExercicios.innerHTML = "";

        exercicios.forEach(exercicio => {
            
            const div = document.createElement("div");
            div.className = "exercicio-item";
            div.dataset.id = exercicio.id;
            div.innerHTML = `<strong>${exercicio.name}</strong>
                             <p>${exercicio.series} SÉRIES - ${exercicio.repetitions} REPETIÇÕES</p>
                             <button class="btn btn-danger remove-ex-btn">REMOVER</button>`;

            listaExercicios.appendChild(div);

        });

    } catch (error) {
        console.error('Erro no loadExercicios:', error);
    }
}

document.getElementById("addTreinoBtn").addEventListener("click", async function () {


    const nomeTreino = prompt("Digite o nome do treino:");

    if (!nomeTreino) {
        alert("Nome do treino não pode ser vazio.");
        return;
    }

    try {

        const response = await fetch('/api/treinos', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: nomeTreino })
        });

        if (!response.ok) {
            console.error('Erro ao criar treino:', response.statusText);
            return;
        }

        await loadTreinos();

    } catch (error) {
        console.error('Erro no addTreinoBtn:', error);
    }
});

document.getElementById("listaTreinos").addEventListener("click", async function (e) {

    const target = e.target;

    if (target.classList.contains("remove-treino-btn")) {

        e.stopPropagation();

        const li = target.parentElement;
        const treinoId = li.dataset.id;

        try {

            const response = await fetch(`/api/treinos/${treinoId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Erro ao remover treino:', response.statusText);
                return;
            }

            await loadTreinos();
            document.getElementById("listaexercicios").innerHTML = "";
        }

        catch (error) {
        console.error('Erro ao remover o treino: :', error);
        }

    return;

    } 

    if (target.classList.contains("treino-item") || target.tagName === "SPAN") {

        const li = target.classList.contains("treino-item") ? target : target.parentElement;
        const treinoId = li.dataset.id;

        document.querySelectorAll(".treino-item").forEach(item => item.classList.remove("active"));
        li.classList.add("active");

        await loadExercicios(treinoId);

    }

});

document.getElementById("listaExercicios").addEventListener("click", async function (e) {

    if (e.target.classList.contains("remove-ex-btn")) {

        const div = e.target.parentElement;
        const exercicioId = div.dataset.id;

        try {

            const response = await fetch(`/api/exercicios/${exercicioId}`, {
                credentials: 'include',
                method: 'DELETE'
            });

            if (!response.ok) {
                console.error('Erro ao remover exercício:', response.statusText);
            }

            const activePlan = document.querySelector(".treino-item.active");
            await loadExercicios(activePlan.dataset.id);

        } catch (error) {
            console.error('Erro ao remover o exercício:', error);
        }
    }
});

document.getElementById("addExercicioBtn").addEventListener("click", async function (){

    const activePlan = document.querySelector(".treino-item.active");

    if (!activePlan) {
        alert("SELECIONE UM TREINO PRIMEIRO!");
        return;
    }

    const planId = activePlan.dataset.id;
    const nomeExercicio = prompt("DIGITE O NOME DO EXERCÍCIO: ");
    const series = prompt("DIGITE O NÚMERO DE SÉRIES: ");
    const repetitions = prompt("DIGITE O NÚMERO DE REPETIÇÕES: ");

    if (nomeExercicio && series && repetitions) {

        try {

            const response = await fetch('/api/exercicios', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    
                    planId: planId,
                    name: nomeExercicio,
                    series: parseInt(series, 10),
                    repetitions: parseInt(repetitions, 10),
                    credentials: 'include'
                })
            });

            if (!response.ok) {
                console.error('Erro ao adicionar exercício:', response.statusText);

            }

            await loadExercicios(planId);
        }

        catch (error) {
            console.error('Erro no addExercicioBtn:', error);
        }
    }
});

document.addEventListener("DOMContentLoaded", async function () {

    loadTreinos();
});
