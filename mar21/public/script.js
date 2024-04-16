const getAnimals = async() => {
    try {
        return (await fetch("http://localhost:3000/api/animals")).json();
    } catch(error){
        console.log("error retrieving data");
        return "";
    }
};

const showAnimals = async() => {
    const animalsJSON = await getAnimals();
    const animalsDiv = document.getElementById("animals-div");

    if(animalsJSON == ""){
        animalsDiv.innerHTML = "Sorry, no animals";
        return;
    }

    //now loop through the json
    animalsJSON.forEach((animal)=>{
        const section = document.createElement("section");
        animalsDiv.append(section);

        const h3 = document.createElement("h3");
        h3.innerHTML = animal.name;
        section.append(h3);

        const img = document.createElement("img");
        img.src = "http://localhost:3000/" + animal.img;
        section.append(img);
    });
};

showAnimals();