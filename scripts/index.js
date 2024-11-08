document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav')
  const sections = document.querySelectorAll('.section')

  // Array of video paths
  const transitionVideos = [
    'media/video/swing.mov',
    'media/video/vibra.mov',
    'media/video/vinyl.mov',
  ]

  // Create video overlay
  const overlay = document.createElement('div')
  overlay.className = 'transition-overlay'

  // Create video element
  const video = document.createElement('video')
  video.muted = true
  video.className = 'transition-video'

  // Create TV overlay images
  const tvOverlayFront = document.createElement('img')
  tvOverlayFront.className = 'tv-overlay tv-front'
  tvOverlayFront.src = 'media/images/tvup.png'

  const tvOverlayBack = document.createElement('img')
  tvOverlayBack.className = 'tv-overlay tv-back'
  tvOverlayBack.src = 'media/images/tvdown.png'

  // Add elements to overlay in correct order
  overlay.appendChild(video)
  overlay.appendChild(tvOverlayBack)
  overlay.appendChild(tvOverlayFront)
  document.body.appendChild(overlay)

  nav.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
      const sectionId = e.target.dataset.section

      // Check if device is mobile
      const isMobile = window.innerWidth <= 768

      if (!isMobile) {
        // Only play transition on desktop
        const randomVideo =
          transitionVideos[Math.floor(Math.random() * transitionVideos.length)]
        video.src = randomVideo

        overlay.classList.add('active')
        video.currentTime = 0
        await video.play()
      }

      // Remove active class from all sections
      sections.forEach((section) => section.classList.remove('active'))

      // Add active class to selected section
      document.getElementById(sectionId).classList.add('active')

      if (!isMobile) {
        // Only wait for video on desktop
        video.addEventListener(
          'ended',
          () => {
            overlay.classList.remove('active')
          },
          { once: true },
        )
      }
    }
  })

  // Load both timeline and causes data
  loadData().then(() => {
    initializeFilters()
  })

  const burger = document.querySelector('.burger')
  const navLinks = document.querySelector('.nav-links')

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('active')
    burger.classList.toggle('toggle')
  })

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !navLinks.contains(e.target) &&
      !burger.contains(e.target) &&
      navLinks.classList.contains('active')
    ) {
      navLinks.classList.remove('active')
      burger.classList.remove('toggle')
    }
  })
})

async function loadData() {
  const response = await fetch('info.json')
  const data = await response.json()

  // Add console log to check the data structure
  console.log('Loaded data:', data)

  // Load causes separately
  populateCauses({
    geneticCauses: data.publicTimeline.geneticCauses,
    otherCauses: data.publicTimeline.otherCauses,
  })

  // Load timeline
  const timelineEntries = document.querySelector('.timeline-entries')
  const template = document.getElementById('timeline-entry-template')

  // Clear existing entries
  timelineEntries.innerHTML = ''

  data.publicTimeline.years.reverse().forEach((year) => {
    const entry = template.content.cloneNode(true)
    const entryElement = entry.querySelector('.timeline-entry')

    // Add data attributes for filtering
    entryElement.dataset.diagnosisChange = Boolean(year.diagnosisChange)
    entryElement.dataset.hasLifeEvents = Boolean(year.lifeEvents?.length)
    entryElement.dataset.hasTreatments = Boolean(year.treatments?.length)

    // Fill in the data
    entry.querySelector('.year').textContent = year.year

    const diagnosisDiv = entry.querySelector('.diagnosis')
    diagnosisDiv.textContent = `Diagnosis: ${year.diagnosis}`
    if (year.diagnosisChange === true) {
      diagnosisDiv.classList.add('diagnosis-change')
    }

    // Add treatments
    const treatmentsDiv = entry.querySelector('.treatments')
    if (year.treatments?.length) {
      treatmentsDiv.innerHTML =
        '<h3>Treatments:</h3>' +
        year.treatments.map((t) => `${t.name} (${t.duration})`).join('<br>')
    }

    // Add life events
    if (year.lifeEvents?.length) {
      const eventsDiv = entry.querySelector('.life-events')
      eventsDiv.innerHTML =
        '<h3>Life Events:</h3>' + year.lifeEvents.join('<br>')
    }

    // Add achievements
    if (year.achievements) {
      const achievementsDiv = entry.querySelector('.achievements')
      achievementsDiv.innerHTML =
        '<h3>Achievements:</h3>' +
        (Array.isArray(year.achievements)
          ? year.achievements.join('<br>')
          : year.achievements)
    }

    // Add hospitalizations
    if (year.hospitalizations > 0) {
      entry.querySelector(
        '.hospitalizations',
      ).textContent = `Hospitalizations: ${year.hospitalizations}`
    }

    timelineEntries.appendChild(entry)
  })
}

// Add new function to populate causes
function populateCauses(data) {
  // Add console log to check the input data
  console.log('Causes data:', data)

  const geneList = document.querySelector('.gene-list')
  const otherCausesList = document.querySelector('.other-causes-list')

  // Check if elements exist
  if (!geneList || !otherCausesList) {
    console.error('Could not find gene-list or other-causes-list elements')
    return
  }

  // Clear existing content
  geneList.innerHTML = ''
  otherCausesList.innerHTML = ''

  // Populate genetic causes with timeline-like styling
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

  // Populate other causes with timeline-like styling
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

// Add filter functionality
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn')
  const entries = document.querySelectorAll('.timeline-entry')

  filterButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove('active'))
      // Add active class to clicked button
      e.target.classList.add('active')

      const filter = e.target.dataset.filter

      entries.forEach((entry) => {
        switch (filter) {
          case 'diagnosis':
            entry.style.display =
              entry.dataset.diagnosisChange === 'true' ? 'flex' : 'none'
            break
          default:
            // 'all'
            entry.style.display = 'flex'
        }
      })
    })
  })
}
