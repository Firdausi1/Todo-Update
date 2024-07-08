$(document).ready(function () {
  const baseUrl = "http://todo.reworkstaging.name.ng/v1";
  const emailRegex = /^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
  let submit = false;

  const banner = $("#banner");
  const message = $("#message");

  $("#login").click(function (e) {
    e.preventDefault();

    const userDetails = {
      username: $("#user").val().trim().toLowerCase(),
      password: $("#userPassword").val(),
    };

    if (userDetails.password === "") {
      submit = false;
    } else {
      submit = true;
    }
    if (userDetails.username === "") {
      submit = false;
    } else if (userDetails.username.match(emailRegex) === null) {
      submit = false;
    } else {
      submit = true;
    }
    // const users = JSON.parse(localStorage.getItem("users")) || [];
    // const user = users.find(
    //   (item) =>
    //     item.username === userDetails.username &&
    //     item.password === userDetails.password
    // );
    if (submit) {
      $.ajax({
        url: `${baseUrl}/users/login`,
        method: "POST",
        data: {
          email: userDetails.username,
          password: userDetails.password,
        },
        success: function (response) {
          if (response.code === 404) {
            banner.slideDown();
            banner.addClass("errorMessage");
            message.html("Invalid Username or password");
            setTimeout(() => {
              banner.slideUp();
            }, 5000);
          } else {
            localStorage.setItem("currentUser", JSON.stringify(response));
            banner.slideDown();
            banner.addClass("successMessage");
            message.html("Login Successful");
            setTimeout(() => {
              window.location.href = "todo.html";
            }, 2000);
          }
        },
        error: function (err) {
          console.log("login", err);
        },
      });
    } else {
      banner.slideDown();
      banner.addClass("errorMessage");
      message.html("Invalid Username or password");
      setTimeout(() => {
        banner.slideUp();
      }, 5000);
    }
  });

  $("#submitBtn").click(function (e) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const error = {
      errorName: $("#errorName"),
      errorEmail: $("#errorEmail"),
      errorPhone: $("#errorPhone"),
      errorPassword: $("#errorPassword"),
      errorConfirm: $("#errorConfirm"),
    };
    const user = {
      username: $("#username").val().trim().toLowerCase(),
      email: $("#email").val(),
      phone: $("#phone").val(),
      password: $("#password").val(),
      confirm: $("#confirm").val(),
    };
    const checkUsername = users.find((item) => item.username === user.username);
    validateFields(error, user, checkUsername);
    if (submit) {
      $.ajax({
        url: `${baseUrl}/users`,
        method: "POST",
        data: {
          name: user.username,
          email: user.email,
          password: user.password,
        },
        success: function (response) {
          if (response.code === 304) {
            banner.slideDown();
            banner.addClass("errorMessage");
            message.html("Email already exists");
          } else {
            localStorage.setItem("currentUser", JSON.stringify(response));
            $(location).prop("href", "todo.html");
          }
        },
        error: function (err) {
          console.log("register", err);
        },
      });
      // users.push(user);
      // users.forEach((element, index) => (element.id = index));
      // localStorage.setItem("currentUser", JSON.stringify(user));
      // localStorage.setItem("users", JSON.stringify(users));
    }
  });

  function validateFields(error, user, checkUsername) {
    const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{10,12}$/;
    const email = user.email.match(emailRegex);
    // const phone = user.phone.match(regex);
    if (user.username === "" || null) {
      error.errorName.show();
      submit = false;
    } else if (checkUsername) {
      error.errorName.html("Username already exists");
      error.errorName.show();
      submit = false;
    } else {
      error.errorName.hide();
      submit = true;
    }
    if (user.email === "") {
      error.errorEmail.show();
      submit = false;
    } else if (email === null) {
      error.errorEmail.html("invalid email address");
      error.errorEmail.show();
      submit = false;
    } else {
      error.errorEmail.hide();
      submit = true;
    }
    // if (user.phone === "") {
    //   error.errorPhone.show();
    //   submit = false;
    // } else if (phone === null) {
    //   error.errorPhone.html(
    //     "phone pattern should match this format countrycode-number (234-9087678987)"
    //   );
    //   error.errorPhone.show();
    //   submit = false;
    // } else {
    //   error.errorPhone.hide();
    //   submit = true;
    // }
    if (user.password === "" || null) {
      error.errorPassword.show();
      submit = false;
    } else {
      error.errorPassword.hide();
      submit = true;
    }
    if (user.confirm === user.password) {
      error.errorConfirm.hide();
      submit = true;
    } else {
      error.errorConfirm.show();
      submit = false;
    }
  }

  $("#showRegister").click(function () {
    $("#registerContainer").show();
    $("#loginContainer").hide();
  });
  $("#showLogin").click(function () {
    $("#registerContainer").hide();
    $("#loginContainer").show();
  });
});
