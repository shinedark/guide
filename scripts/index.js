document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const navButtons = document.querySelectorAll('.nav-button')
  const burger = document.querySelector('.burger')
  const navLinks = document.querySelector('.nav-links')
  const timelineFilters = document.querySelectorAll('.filter-btn')
  const timelineEntries = document.querySelectorAll('.timeline-entry')

  // Load data immediately
  loadData()

  // Smooth scroll to section
  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Mobile menu toggle
  function toggleMobileMenu() {
    burger.classList.toggle('active')
    navLinks.classList.toggle('active')
    document.body.classList.toggle('menu-open')
  }

  // Event Listeners
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sectionId = button.dataset.section
      scrollToSection(sectionId)

      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        toggleMobileMenu()
      }
    })
  })

  burger?.addEventListener('click', toggleMobileMenu)

  // Timeline filtering
  function filterTimeline(category) {
    timelineFilters.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === category)
    })

    timelineEntries.forEach((entry) => {
      entry.style.display =
        category === 'all' || entry.dataset.category === category
          ? 'block'
          : 'none'
    })
  }

  timelineFilters.forEach((button) => {
    button.addEventListener('click', () => {
      filterTimeline(button.dataset.filter)
    })
  })

  // Initialize timeline filter
  filterTimeline('all')

  // Handle initial load with hash
  if (window.location.hash) {
    const sectionId = window.location.hash.slice(1)
    scrollToSection(sectionId)
  }
})

// Load data function
async function loadData() {
  try {
    const response = await fetch('info.json')
    const data = await response.json()

    // Load causes
    populateCauses({
      geneticCauses: data.publicTimeline.geneticCauses,
      otherCauses: data.publicTimeline.otherCauses,
    })

    // Load timeline
    populateTimeline(data.publicTimeline.years)
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// Populate timeline entries
function populateTimeline(years) {
  const timelineEntries = document.querySelector('.timeline-entries')
  const template = document.getElementById('timeline-entry-template')

  if (!timelineEntries || !template) {
    console.error('Required timeline elements not found')
    return
  }

  // Clear existing entries
  timelineEntries.innerHTML = ''

  // Sort years in reverse chronological order
  years
    .sort((a, b) => b.year - a.year)
    .forEach((yearData) => {
      const entry = template.content.cloneNode(true)

      // Set year
      entry.querySelector('.year').textContent = yearData.year

      // Set diagnosis if exists
      if (yearData.diagnosis) {
        const diagnosisDiv = entry.querySelector('.diagnosis')
        diagnosisDiv.innerHTML = `<strong>Diagnosis:</strong> ${yearData.diagnosis}`
        entry.querySelector('.timeline-entry').dataset.diagnosisChange = 'true'
      }

      // Set treatments if exist
      if (yearData.treatments) {
        const treatmentsDiv = entry.querySelector('.treatments')
        const treatments = Array.isArray(yearData.treatments)
          ? yearData.treatments
          : [yearData.treatments]

        const treatmentsList = treatments
          .map((t) => {
            if (typeof t === 'object') {
              return `<li>${t.name || ''} ${
                t.duration ? `(${t.duration})` : ''
              }</li>`
            }
            return `<li>${t}</li>`
          })
          .join('')

        treatmentsDiv.innerHTML = `
        <strong>Treatments:</strong>
        <ul>${treatmentsList}</ul>
      `
      }

      // Set life events if exist
      if (yearData.lifeEvents) {
        const eventsDiv = entry.querySelector('.life-events')
        const events = Array.isArray(yearData.lifeEvents)
          ? yearData.lifeEvents
          : [yearData.lifeEvents]

        const eventsList = events
          .map((e) => {
            if (typeof e === 'object') {
              return `<li>${e.event || e.description || JSON.stringify(e)}</li>`
            }
            return `<li>${e}</li>`
          })
          .join('')

        eventsDiv.innerHTML = `
        <strong>Life Events:</strong>
        <ul>${eventsList}</ul>
      `
      }

      // Set achievements if exist
      if (yearData.achievements) {
        const achievementsDiv = entry.querySelector('.achievements')
        const achievements = Array.isArray(yearData.achievements)
          ? yearData.achievements
          : [yearData.achievements]

        const achievementsList = achievements
          .map((a) => {
            if (typeof a === 'object') {
              return `<li>${
                a.achievement || a.description || JSON.stringify(a)
              }</li>`
            }
            return `<li>${a}</li>`
          })
          .join('')

        achievementsDiv.innerHTML = `
        <strong>Achievements:</strong>
        <ul>${achievementsList}</ul>
      `
      }

      // Set hospitalizations if exist
      if (yearData.hospitalizations) {
        const hospitalizationsDiv = entry.querySelector('.hospitalizations')
        const hospitalizations = Array.isArray(yearData.hospitalizations)
          ? yearData.hospitalizations
          : [yearData.hospitalizations]

        const hospitalizationsList = hospitalizations
          .map((h) => {
            if (typeof h === 'object') {
              return `<li>${
                h.reason || h.description || JSON.stringify(h)
              }</li>`
            }
            return `<li>${h}</li>`
          })
          .join('')

        hospitalizationsDiv.innerHTML = `
        <strong>Hospitalizations:</strong>
        <ul>${hospitalizationsList}</ul>
      `
      }

      timelineEntries.appendChild(entry)
    })
}

// Populate causes
function populateCauses(data) {
  const geneList = document.querySelector('.gene-list')
  const otherCausesList = document.querySelector('.other-causes-list')

  if (!geneList || !otherCausesList) {
    console.error('Causes list elements not found')
    return
  }

  // Clear existing content
  geneList.innerHTML = ''
  otherCausesList.innerHTML = ''

  // Populate genetic causes
  if (data.geneticCauses) {
    Object.entries(data.geneticCauses).forEach(([gene, mutations]) => {
      const geneDiv = document.createElement('div')
      geneDiv.className = 'timeline-entry'

      let mutationsHtml = ''
      if (typeof mutations === 'object') {
        mutationsHtml = Object.entries(mutations)
          .map(
            ([rsid, value]) => `<div class="mutation">${rsid}: ${value}</div>`,
          )
          .join('')
      } else {
        mutationsHtml = `<div class="mutation">${mutations}</div>`
      }

      geneDiv.innerHTML = `
        <div class="entry-content">
          <h3>${gene}</h3>
          ${mutationsHtml}
        </div>
      `
      geneList.appendChild(geneDiv)
    })
  }

  // Populate other causes
  if (data.otherCauses) {
    Object.entries(data.otherCauses).forEach(([cause, description]) => {
      const causeDiv = document.createElement('div')
      causeDiv.className = 'timeline-entry'

      causeDiv.innerHTML = `
        <div class="entry-content">
          <h3>${cause}</h3>
          <div class="description">${description}</div>
        </div>
      `
      otherCausesList.appendChild(causeDiv)
    })
  }
}
