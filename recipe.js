const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const NAME_SEARCH_URL = `${BASE_URL}search.php?s=`;
const CATEGORY_SEARCH_URL = `${BASE_URL}filter.php?c=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

searchBtn.addEventListener("click", searchMeals);
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchMeals();
    }
})
mealsContainer.addEventListener("click", mealClick);
backBtn.addEventListener("click", () => {
    mealDetails.classList.add("hidden");
})

async function searchMeals() {
    errorContainer.classList.add("hidden");
    mealDetails.classList.add("hidden");

    const searchTerm = searchInput.value.trim();

    // no input edge case
    if (!searchTerm) {
        errorContainer.textContent = "Please enter a search term";
        errorContainer.classList.remove("hidden");
        return;
    }

    try {
        resultHeading.textContent = `Searching for "${searchTerm}"...`
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden");

        // fetching from MealDB API
        const [nameResponse, categoryResponse] = await Promise.all([
            fetch(`${NAME_SEARCH_URL}${searchTerm}`),
            fetch(`${CATEGORY_SEARCH_URL}${searchTerm}`)
        ]);

        const nameData = await nameResponse.json();
        const categoryData = await categoryResponse.json();
        let meals = [];

        if (nameData.meals) {
            meals = [...nameData.meals];
        }

        if (categoryData.meals) {
            const lookup = categoryData.meals.map(meal => 
                fetch(`${LOOKUP_URL}${meal.idMeal}`).then(resp => resp.json())
            );

            const lookupResponse = await Promise.all(lookup);
            const fullMeals = lookupResponse.map(r => r.meals[0]);
            meals = [...meals, ...fullMeals];
        }
        console.log(meals);

        const uniqueMeals = Array.from(
            new Map(meals.map(meal => [meal.idMeal, meal])).values()
        );

        if (uniqueMeals.length === 0) {
            resultHeading.textContent = ``;
            mealsContainer.innerHTML = "";
            errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term`;
            errorContainer.classList.remove("hidden");

        } else {
            resultHeading.textContent = `Showing ${uniqueMeals.length} search results for "${searchTerm}":`;
            displayMeals(uniqueMeals);
            searchInput.value = ""; 
        }

    } catch (error) {
        errorContainer.textContent = "Something went wrong! Please try again.";
        errorContainer.classList.remove("hidden");
    }
}

function displayMeals(meals) {
    mealsContainer.innerHTML = "";

    meals.forEach((meal) => {
        const tags = meal.strTags 
            ? meal.strTags.split(",").map(tag => tag.trim()).filter(tag => 
                !meal.strCategory || tag.toLowerCase() !== meal.strCategory.toLowerCase()
            )
            : [];

        mealsContainer.innerHTML += `
        <div class="meal" data-meal-id="${meal.idMeal}">
            <img src = "${meal.strMealThumb}" alt = "${meal.strMeal}">
            <div class = "meal-info">
                <h3 class = "meal-title"> ${meal.strMeal} </h3>

                <d class = "meal-meta">
                    ${meal.strCategory ? `<div class = "meal-category"> ${meal.strCategory} </div>`: ""}
                    ${tags.map(tag => `<span class = "meal-category"> ${tag} </span>`).join("")}
                </d
            </div>
        </div>
        `;
    })
}

async function mealClick(e) {
    const mealElement = e.target.closest(".meal");
    if (!mealElement) {
        return;
    }
    const mealID = mealElement.getAttribute("data-meal-id");

    try {
        const response = await fetch(`${LOOKUP_URL}${mealID}`);
        const data = await response.json();

        console.log(data);
        if (data.meals && data.meals[0]) {
            const meal = data.meals[0];
            const ingredients = [];

            for (let i = 1; i < 21; i++) {
                if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
                    ingredients.push({
                        ingredient: meal[`strIngredient${i}`],
                        measure: meal[`strMeasure${i}`],
                    });
                }
            }

            mealDetailsContent.innerHTML = `
                <img src = "${meal.strMealThumb}" alt = "${meal.strMeal}" class = "meal-details-img">
                <h2 class = "meal-details-title"> ${meal.strMeal} </h2>
                <div class = "meal-details-category">
                    <span> ${meal.strCategory || "Uncategorised"} </span>
                </div>
                <div class = "meal-details-instructions">
                    <h3> Instructions </h3> 
                    <p> ${meal.strInstructions} </p>
                </div>
                <div class = "meal-details-ingredients">
                    <h3> Ingredients </h3>
                    <ul class = "ingredients-list">
                        ${ingredients.map(
                            (item) => `
                                <li> 
                                    <i class = "fas fa-check-circle"></i> ${item.measure} ${item.ingredient}
                                </li>
                                `
                        ).join("")}
                    </ul>
                </div>
                ${
                    meal.strYoutube ? `
                        <a href = "${meal.strYoutube}" target = "_blank" class = "youtube-link">
                            <i class = "fab fa-youtube"></i> Watch Video
                        </a>
                    `
                        : ""
                }
            `;
            
            mealDetails.classList.remove("hidden");
            mealDetails.scrollIntoView({behavior: "smooth"});
        }

    } catch (error) {
        errorContainer.textContent = "Could not load recipe details. Please try again later!";
        errorContainer.classList.remove("hidden");
    }
}

