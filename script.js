// 1. First, we get all the HTML elements we'll need using DOM selectors
const select = document.getElementById("languageSelect");
const repositorySection = document.querySelector(".repository");
const loadingSpinner = document.querySelector(".loading");
const errorSection = document.querySelector(".error");
const retrySection = document.querySelector(".retry-search");

// 2. Hide sections initially (adding CSS classes)
repositorySection.classList.add("hidden");
loadingSpinner.classList.add("hidden");
errorSection.classList.add("hidden");

// 3. Function to get programming languages from external API
async function getProgrammingLanguages() {
  const response = await fetch(
    "https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json"
  );
  return await response.json();
}

// 4. Function to populate the dropdown with languages
async function populateLanguageSelect() {
  const languages = await getProgrammingLanguages();
  const fragment = document.createDocumentFragment();

  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.value;
    option.textContent = lang.title;
    fragment.appendChild(option);
  });

  select.appendChild(fragment);
}

// 5. Function to fetch repositories from GitHub API
async function getGitHubRepositories(language) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=language:${language}`
  );
  return await response.json();
}

// 6. Function to get a random repository from results
function getRandomRepository(repositories) {
  const totalRepos = repositories.items.length;
  return repositories.items[Math.floor(Math.random() * totalRepos)];
}

// 7. Function to create and display repository information
function createRepositoryElements(repository) {
  const repoHTML = `
    <h2>${repository.name}</h2>
    <p>${repository.description || "No description available"}</p>
    <div class="project-stats">
      <span>
        <img src="img/circle-svgrepo-com.svg">
        ${repository.language}
      </span>
      <span>
        <img src="img/star-svgrepo-com.svg">
        ${repository.stargazers_count}
      </span>
      <span>
        <img src="img/git-fork-svgrepo-com.svg">
        ${repository.forks}
      </span>
      <span>
        <img src="img/exclamation-circle-svgrepo-com.svg">
        ${repository.open_issues}
      </span>
    </div>
  `;
  repositorySection.innerHTML = repoHTML;
}
function showError() {
  repositorySection.classList.add("hidden");
  errorSection.classList.remove("hidden");
  errorSection.innerHTML = "<p>Error fetching repositories</p>";
  retrySection.innerHTML = ""; // Clear any existing buttons

  const retryButton = document.createElement("button");
  retryButton.className = "retry-button-error";
  retryButton.textContent = "Click to retry";

  retrySection.appendChild(retryButton);
  retryButton.addEventListener("click", () => {
    displayRepository(select.value, true);
  });
}

// 9. Main function to handle displaying repository
async function displayRepository(language, addRetryButton = true) {
  loadingSpinner.classList.remove("hidden");
  repositorySection.classList.add("hidden");
  errorSection.classList.add("hidden");
  retrySection.innerHTML = ""; // Clear any existing buttons

  try {
    const repos = await getGitHubRepositories(language);

    // Check if repos exist and have items
    if (!repos.items || repos.items.length === 0) {
      throw new Error("No repositories found");
    }

    const randomRepo = getRandomRepository(repos);
    errorSection.classList.add("hidden");
    repositorySection.classList.remove("hidden");
    createRepositoryElements(randomRepo);

    // Add refresh button on success
    if (addRetryButton) {
      addRefreshButton();
    }
  } catch (error) {
    showError();
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

// 10. Function to add refresh button
function addRefreshButton() {
  retrySection.innerHTML = ""; // Clear any existing buttons

  const refreshButton = document.createElement("button");
  refreshButton.className = "retry-button";
  refreshButton.textContent = "Refresh";

  retrySection.appendChild(refreshButton);
  refreshButton.addEventListener("click", () => {
    displayRepository(select.value, true);
  });
}

// 11. Event listener for language selection
select.addEventListener("change", (event) => {
  if (event.target.value) {
    displayRepository(event.target.value, true);
  } else {
    repositorySection.classList.remove("hidden");
    repositorySection.innerHTML = "<p>Please select a language</p>";
    errorSection.classList.add("hidden");
    retrySection.innerHTML = ""; // Clear any buttons
  }
});

// 12. Initialize the app
populateLanguageSelect();
