const baseUrl = `http://localhost:3001`


$(document).ready(function () {
  checkLocalStorage()
  $("#btn-login").on("click", (e) => {
    e.preventDefault()
    login()
  })
  $("#btn-register").on("click", (e) => {
    e.preventDefault()
    register()
    findAllTodo()
  })

  $("btn-google").on("click", (e) => {
    e.preventDefault()
    onSignIn()
  })

  $("#btn-logout").on("click", (e) => {
    e.preventDefault()
    logout()
  })

  $("#list-todo-today").on("click", (e) => {
    e.preventDefault()

  })
});

function checkLocalStorage() {
  if (!localStorage.access_token) {
    $("#home-page").hide()
    $("#login-register-page").show()

  } else {
    $("#home-page").show()
    $("#login-register-page").hide()
    findAllTodo()
  }
}


function login() {
  const email = $("#email").val()
  const password = $("#password").val()
  $.ajax({
    url: baseUrl + `/users/login`,
    method: "POST",
    data: { email, password }
  })
    .done(response => {
      Swal.fire(
        'Login Success!',
        'You clicked the button!',
        'success'
      )
      localStorage.setItem('access_token', response.access_token)
      checkLocalStorage()
    })
    .fail(err => {
      let message = err.responseJSON.message.map(el => el)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message
      })
    })
    .always(_ => {
      $("#email").val("")
      $("#password").val("")
    })
}


function register() {
  const email = $("#email").val()
  const password = $("#password").val()
  $.ajax({
    url: baseUrl + `/users/register`,
    method: "POST",
    data: { email, password }
  })
    .done(response => {
      Swal.fire(
        'Register Success, Login to continue!',
        'You clicked the button!',
        'success'
      )

    })
    .fail(err => {
      let message = err.responseJSON.message.map(el => el.toLowerCase())
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message
      })
    })
    .always(el => {
      $("#email").val("")
      $("#password").val("")
    })
}


function logout() {
  localStorage.clear()
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });

  checkLocalStorage()
}

function onSignIn(googleUser) {
  const id_token = googleUser.getAuthResponse().id_token;
  $.ajax({
    url: baseUrl + '/users/googleLogin',
    method: "POST",
    data: {
      googleToken: id_token
    }
  })
    .done(response => {
      localStorage.setItem("access_token", response.access_token);
      checkLocalStorage();
    })
    .fail(err => {
      console.log(err)
    })
}

function findAllTodo() {
  $.ajax({
    url: baseUrl + `/todos?due_date=today`,
    method: "GET",
    headers: {
      access_token: localStorage.getItem('access_token')
    }
  })
    .then(todos => {
      $("#list-todo-today").empty();
      todos.forEach((el, i) => {

        $("#list-todo-today").append(`
        <div class="col-6 border">
          <p>${i + 1}. ${el.title}</p> 
          </div>
          <div class="col-6 text-end pl-2 border d-flex justify-content-end">
          <button type="button" class="trans" data-bs-toggle="modal" data-bs-target="#getByIdTodo" onclick="getByIdTodo(${el.id})"> <i class="fas fa-info-circle"></i></button><br />
          <button type="button" class="trans" onclick="updateTodo(${el.id})"> <i class="fas fa-edit"></i></button><br />
          <button type="button" class="trans" onclick="destroyByIdTodo(${el.id})"> <i class="fas fa-trash"></i></button><br />
        </div>
        `)
      });

    })
    .catch(err => {
      console.log(err.responseJSON)
    })
  }
  
  
  function getByIdTodo(id) {
    $.ajax({
      url: baseUrl + '/todos/' + id,
      method: "GET",
      headers: { access_token: localStorage.getItem('access_token') }
    })
    .done(todo => {
      console.log(todo, 'detail>>>')
      $("#getByIdTodo").show();
      $("#title-todo").val(todo.title)
      $("#due_date-todo").val(todo.due_date.split('T')[0])
      $("#status-todo").val(todo.status)
      $("#user-id-todo").val(todo.UserId)
      $("#project-id-todo").val(todo.ProjectId)

      
    })
    .fail(err => console.log(err.responseJSON))


}