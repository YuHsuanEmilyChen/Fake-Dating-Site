// Bootstrap function - automatically run carousel 
$('.carousel').carousel({
  interval: 2000
})

// Variables
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
const btnGroup = document.querySelector('.btn-group')
const userList = []
let filteredUser = []
const requestList = JSON.parse(localStorage.getItem('sentList')) || []
const favoriteList = JSON.parse(localStorage.getItem('localList')) || []
const USER_PER_PAGE = 20
let userByGender = []
let currentGender = 'all'





// function - render user
function renderUser(data) {
  let rawHTML = ''
  let gender = ''
  let heart = ''
  let request = ''

  data.forEach(({ id, gender, avatar, name, surname, }) => {

    switch (gender) {
      case 'female':
        gender = `<i class="bi bi-gender-female" style="color: #B50A46;"></i>`
        break
      case 'male':
        gender = `<i class="bi bi-gender-male" style="color: #290CF3;"></i>`
        break
    }

    if (requestList.findIndex((user) => user.id === id) >= 0) {
      request = `<i class="bi bi-person-plus-fill add-btn" data-id="${id}"></i>`
    } else {
      request = `<i class="bi bi-person-plus add-btn" data-id="${id}"></i>`
    }

    if ((favoriteList.findIndex((friend) => friend.id === id)) >= 0) {

      heart = `<i class="bi bi-suit-heart-fill heart-btn" data-id="${id}"></i>`
    } else {
      heart = `<i class="bi bi-suit-heart heart-btn" data-id="${id}"></i>`
    }


    rawHTML += `
      <div class="col-sm-12 col-md-6 col-lg-3">
        <div class="card m-1">
          <img src="${avatar}" class="card-img-top rounded-circle btn btn-show-modal" alt="card-image" data-toggle="modal" data-target="#user-modal" data-id="${id}">
          <div class="card-body">
            <h6 class="card-title">${name} ${surname}</h6>
            ${gender}
          </div>
          <div class="card-footer p-1 d-flex justify-content-around">
            <div class="btn">
              ${heart}
            </div>
            <div class="btn">
              ${request}
            </div>
          </div>
          
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// Function - render Modal
function renderModal(id) {

  const modalTitle = document.querySelector('#user-modal-title')
  const modalBirthday = document.querySelector('#user-modal-birthday')
  const modalEmail = document.querySelector('#user-modal-email')
  const modalImage = document.querySelector('#modal-image')
  const modalLocation = document.querySelector('#user-modal-locate')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    modalTitle.textContent = `${data.name} ${data.surname}`
    modalImage.src = `${data.avatar}`
    modalLocation.innerHTML = `<i class="bi bi-person-square"></i> ${data.age} | ${data.region} `
    modalBirthday.innerHTML = `<i class="bi bi-calendar-date-fill"></i> ${data.birthday}`
    modalEmail.innerHTML = `<i class="bi bi-envelope-fill"></i> ${data.email}`

  })
}


// Function - Add to favorite
function addOrRemoveFromList(target, id) {

  // 找到id指的是哪個用戶
  const person = userList.find((user) =>
    user.id === id
  )

  const parentElement = target.parentElement
  const index = favoriteList.findIndex((user) =>
    user.id === id
  )

  // 因為愛心可以進行兩個動作，如果在favoriteList找到用戶資料，代表這時是要進行移除的動作；反之則是增加
  if (index >= 0) {

    favoriteList.splice(index, 1)
    localStorage.setItem('localList', JSON.stringify(favoriteList))
    // 實心愛心 => 空心愛心
    target.remove()
    parentElement.innerHTML = `<i class="bi bi-suit-heart heart-btn" data-id="${id}"></i> `

  } else {

    favoriteList.push(person)
    localStorage.setItem('localList', JSON.stringify(favoriteList))
    // 空心愛心 => 實心愛心
    target.remove()
    parentElement.innerHTML = `<i class="bi bi-suit-heart-fill heart-btn" data-id="${id}"></i>`
  }

}

// Function - Send/remove friend request
function friendRequest(target, id) {

  const parentElement = target.parentElement
  const friend = userList.find((item) =>
    item.id === id
  )


  if (target.matches('.bi-person-plus')) {
    target.remove()
    requestList.push(friend)
    localStorage.setItem('sentList', JSON.stringify(requestList))
    parentElement.innerHTML = `<i class="bi bi-person-plus-fill add-btn" data-id="${id}"></i>`
    alert(`Friend request has been sent! Get ready to meet a new friend!`)

  } else {
    const index = requestList.findIndex((item) =>
      item.id === id)
    target.remove()
    requestList.splice(index, 1)
    localStorage.setItem('sentList', JSON.stringify(requestList))
    parentElement.innerHTML = `<i class="bi bi-person-plus add-btn" data-id="${id}"></i>`
    alert(`Oh no! Are you sure you want to miss this chance?`)
  }


}

// Function - Render paginator
function renderPaginator(amount) {
  const pageAmount = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= pageAmount; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}" id="page-for-all">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML

}

// Function - Render paginator for btn group
function renderPaginatorInGroup(amount) {

  const pageAmount = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= pageAmount; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}" id="page-in-group">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML

}

// Function - Set paginator group
function showUserByPage(page) {

  const data = (filteredUser.length) ? filteredUser : userList
  const indexStart = (page - 1) * USER_PER_PAGE
  return data.slice(indexStart, indexStart + USER_PER_PAGE)

}

// Function - Set paginator group for btn group
function showUserByPageInGroup(page) {
  const data = (filteredUser.length) ? filteredUser : userByGender
  const indexStart = (page - 1) * USER_PER_PAGE
  return data.slice(indexStart, indexStart + USER_PER_PAGE)
}

// Function - Filter gender
function genderFilter(gender) {
  let filter = []

  switch (gender) {
    case 'male':
      filter = userList.filter((item) => item.gender === "male")
      break
    case 'female':
      filter = userList.filter((item) => item.gender === "female")
      break
  }
  return filter


}


// Default value - render data 
axios.get(INDEX_URL).then((response) => {
  userList.push(...response.data.results)
  renderUser(showUserByPage(1))
  renderPaginator(userList.length)

})



// Event - show modal and add to favorite
dataPanel.addEventListener('click', function showModal(event) {
  const target = event.target
  const id = target.dataset.id

  if (target.matches('.btn-show-modal')) {
    renderModal(id)
  }

})

// Event - add to favorite list and send friend request
dataPanel.addEventListener('click', function clickOnBtn(event) {
  const target = event.target
  const id = Number(target.dataset.id)

  if (target.matches('.heart-btn')) {
    addOrRemoveFromList(target, id)
  }

  if (target.matches('.add-btn')) {
    friendRequest(target, id)

  }
})

// Event - click paginator and render user list
paginator.addEventListener('click', function clickOnPaginator(event) {
  if (event.target.tagName !== 'A') return
  const page = event.target.dataset.page
  switch (event.target.id) {
    case 'page-for-all':
      renderUser(showUserByPage(page))
      break
    case 'page-in-group':
      renderUser(showUserByPageInGroup(page))
  }
})


// Event - search user and show result dynamically
searchForm.addEventListener('input', function searchName(event) {

  const keyword = searchInput.value.trim().toLowerCase()

  if (keyword.length >= 0) {

    switch (currentGender) {
      case 'all':
        filteredUser = userList.filter((user) =>
          user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
        )
        break
      case 'female':
        filteredUser = genderFilter('female').filter((user) =>
          user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
        )
        break
      case 'male':
        filteredUser = genderFilter('male').filter((user) =>
          user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
        )
        break
    }
    if (currentGender === 'all' && filteredUser.length) {
      renderPaginator(filteredUser.length)
      renderUser(showUserByPage(1))
    } else {
      renderPaginatorInGroup(filteredUser.length)
      renderUser(showUserByPageInGroup(1))
    }

    if (!filteredUser.length) {
      dataPanel.innerHTML = `<div class="p-3 m-auto"><h1 style="color: red;">NO MATCHED RESULT!</h1></div>`
      paginator.innerHTML = ''
    }
  }
})

// Event search - Search user with click
searchForm.addEventListener('submit', function searchNameByClick(event) {

  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()

  filteredUser = userList.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))


  if (keyword.length === 0) {
    return alert(`Do not leave the blank empty.`)
  } else if (filteredUser.length === 0) {
    return alert(`There is no matched result with ${keyword}`)
  }
  renderPaginator(filteredUser.length)
  renderUser(showUserByPage(1))

})

// Event - button group 
btnGroup.addEventListener('click', function eventOnBtnGroup(event) {

  currentGender = event.target.id
  // 將filteredUser歸零避免render不出user group
  filteredUser = []
  
  switch (currentGender) {
    case 'all':
      renderUser(showUserByPage(1))
      renderPaginator(userList.length)
      currentGender = 'all'
      break
    case 'male':
      userByGender = genderFilter(currentGender)
      renderUser(showUserByPageInGroup(1))
      renderPaginatorInGroup(userByGender.length)
      currentGender = 'male'
      break
    case 'female':
      userByGender = genderFilter(currentGender)
      renderUser(showUserByPageInGroup(1))
      renderPaginatorInGroup(userByGender.length)
      currentGender = 'female'
      break
  }

})