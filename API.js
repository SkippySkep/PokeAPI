"use strict"

const enterKey = document.getElementById('pokemon');

enterKey.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        getData();
    }
})

const displayedIDs = new Set();

async function fetchJson(url) {
    try {
        const response = await fetch(url);
        //console.log('Data received:', searchInfo);

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return response.json();
    } catch(error) {
        throw error;
    }
}

function clearDisplay() {
    document.getElementById('mainPokemon').innerHTML = '';
    document.getElementById('evolutionTree').innerHTML = '';
    document.getElementById('relatedHeader').style.display = 'none';
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.innerHTML = '';
    }
    relatedHeaderAdded = false;
}

async function getData() {
    clearDisplay();
    displayedIDs.clear();

    let searchPokemon = document.getElementById('pokemon').value;

    const searchLink = `https://pokeapi.co/api/v2/pokemon/${searchPokemon}/`;

    try {
        const searchInfo = await fetchJson(searchLink);
 
        displayPokemon(searchInfo, true);
    
        const preEvoIDs = await getPreEvo(searchInfo.id, searchInfo.species.name);
        for (const id of preEvoIDs) {
            const evoData = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}/`);
            displayPokemon(evoData);
        }
        
        await getEvoSpecies(searchInfo.id);

    } catch (error) {
        clearDisplay();
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.innerHTML = `<p>Error: ${error.message || error}. Please check the name and try again.</p>`;   
        }
    }
}

async function checkHasEvo(pokeID) {
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokeID}/`;

    try {
        const speciesInfo = await fetchJson(speciesUrl);
        const species = speciesInfo.evolution_chain.url;
        const speciesEvo = await fetchJson(species);

        let current = speciesEvo.chain;

        while (current && current.species.name !== speciesInfo.name) {
            if (current.evolves_to.length > 0) {
                current = current.evolves_to[0]; 
            } else {
                current = null;
            }
        }

        if (current && current.evolves_to.length > 0) {
            const nextEvo = current.evolves_to[0].species.url;
            const match = nextEvo.match(/\/pokemon-species\/(\d+)\//);

            return match ? match[1] : null;
        } 
            
         return null;
    } catch (error) {
        console.log('error checkHasEvo', error);
    }
}

async function getEvoSpecies(pokeID) {
    const evoUrl = `https://pokeapi.co/api/v2/pokemon/${pokeID}/`;

    try {
        const evoData = await fetchJson(evoUrl);
        displayPokemon(evoData);

        let nextEvoID = await checkHasEvo(pokeID);

        if (nextEvoID) {
            await getEvoSpecies(nextEvoID);
        } else {
            console.log('No further evolution');
        }

        return null;

    } catch (error) {
        console.error('error getEvoSpecies', error);
    }
}

async function getPreEvo(pokeID, currentName) {
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokeID}/`;

    try {
        const speciesInfo = await fetchJson(speciesUrl);
        const evoChainUrl = speciesInfo.evolution_chain.url;

        const evolutionData = await fetchJson(evoChainUrl);

        const evolutionLine = [];

        function traverse(node) {
            evolutionLine.push(node.species);
            if (node.evolves_to.length > 0) {
                traverse(node.evolves_to[0]); 
            }
        }

        traverse(evolutionData.chain);

        const currentIndex = evolutionLine.findIndex(species => species.name === currentName);

        const preEvoSpecies = evolutionLine.slice(0, currentIndex);

        return preEvoSpecies.map(species => {
            const match = species.url.match(/\/pokemon-species\/(\d+)\//);
            return match ? match[1] : null;
        }).filter(Boolean); 

    } catch (error) {
        console.error('Error getPreEvo:', error);
        return [];
    }
}

let relatedHeaderAdded = false;

function displayPokemon(pokemon, isMain = false) {
    if (displayedIDs.has(pokemon.id)) {
        return;
    }
    displayedIDs.add(pokemon.id);

    const pokeInfoHtml = `
        <div class='evoItem'>
            <img src="${pokemon.sprites.front_default}">
            <p>#${pokemon.id}: ${pokemon.species.name}</p>
        </div>
    `;

    if (isMain) {
        document.getElementById('mainPokemon').innerHTML = pokeInfoHtml;

        document.getElementById('evolutionTree').innerHTML = '';

        relatedHeaderAdded = false;
    } else {
        if (!relatedHeaderAdded) {
            document.getElementById('relatedHeader').style.display = 'block';

            relatedHeaderAdded = true;
        }
            document.getElementById('evolutionTree').innerHTML += pokeInfoHtml;
    }
}



/* if getting evolution info by id is ever needed

async function getEvoDataByID(id) {
    const searchLink = `https://pokeapi.co/api/v2/pokemon/${id}/`;

    try {
        const searchInfo = await fetchJson(searchLink);
 
        displayAdditionalEvoInfo(searchInfo);

        await getEvoSpecies(searchInfo.id);

    } catch (error) {
        document.getElementById('pokemonInfo').innerHTML = `<p>Error: ${error}</p>`
    }
}

*/
