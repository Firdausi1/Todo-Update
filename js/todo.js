import { pastelColors } from "./tagColors.js";

$(document).ready(function () {
  const baseUrl = "http://todo.reworkstaging.name.ng/v1";
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  $("#username").html(currentUser.name.split(" ")[0]);

  //variables
  let categories = [];
  let tasks = [];
  let selectedTag = [];
  let activeCategory = "";
  let hideDone = JSON.parse(localStorage.getItem("hideDone")).value || false;

  $("#hideDone").attr("checked", hideDone);

  let currentTaskId;
  let currentTagId;

  //hide add task button if category is zero

  //modal settings
  function close() {
    $("#deleteModal").hide();
    $("#taskModal").hide();
    $("#categoryModal").hide();
    $("#modal").hide();
    $("#deleteTagModal").hide();
  }
  close();
  $(".cancel").click(function () {
    close();
  });
  $(".addTask").click(function () {
    // displayTags();
    $("#modal").show();
    $("#taskModal").show();
  });
  $(".addCat").click(function () {
    $("#modal").show();
    $("#categoryModal").show();
  });
  $(document).on("click", ".confrimDelete", function () {
    const closestId = $(this).closest(".card");
    const id = closestId.data("id");

    currentTaskId = id;
    $("#modal").show();
    $("#deleteModal").show();
  });
  $(document).on("click", ".confrimDeleteTag", function () {
    const closestId = $(this).closest(".cat");
    const id = closestId.data("id");

    currentTagId = id;
    $("#modal").show();
    $("#deleteTagModal").show();
  });

  //categories
  $("#addCategory").click(function (e) {
    e.preventDefault();
    let validate = false;

    const catName = $("#categoryName").val().trim().toLowerCase();
    const checkCatName = categories.find((item) => item.title === catName);

    if (catName === "") {
      $("#errorCategory").show();
      validate = false;
    } else if (checkCatName) {
      if (checkCatName.id === currentTagId) {
        validate = true;
        $("#errorCategory").hide();
      } else {
        $("#errorCategory").html("Category already exists");
        $("#errorCategory").show();
        validate = false;
      }
    } else {
      validate = true;
    }

    if (validate) {
      if (currentTagId === undefined) {
        $.ajax({
          url: `${baseUrl}/tags`,
          method: "POST",
          data: {
            user_id: currentUser.id,
            title: catName,
            color: pastelColors[categories.length],
          },
          success: function () {
            close();
            getAllTags();
            $(".addTask").show();
            $("#categoryName").val("");
          },
          error: function (err) {
            console.log("addTag", err);
          },
        });
      } else {
        $.ajax({
          url: `${baseUrl}/tags/${currentTagId}`,
          method: "PUT",
          data: {
            title: catName,
          },
          success: function () {
            close();
            getAllTags();
            $(".addTaskIcon").show();
            $("#categoryName").val("");
          },
          error: function (err) {
            console.log("editTag", err);
          },
        });
      }
    }
  });
  function getAllTags() {
    $.ajax({
      url: `${baseUrl}/tags?user_id=${currentUser.id}`,
      method: "GET",
      contentType: "application/json",
      success: function (response) {
        categories = response;
        displayCategories(response);
        displayTags(response);
        if (response.length === 0) {
          $(".addTaskIcon").hide();
        }
      },
      error: function (err) {
        console.log("addTag", err);
      },
    });
  }
  getAllTags();
  function displayCategories(categories) {
    const display = $("#displayCategory");
    display.empty();

    categories.forEach((cat) => {
      display.append(`<li class="flex justify-between tag cat ${
        activeCategory === cat.title && "activeTag"
      }" data-id=${cat.id}>
      <div class="flex">
        <span class="catIcon" style="background: ${cat.color}"></span>
        <p class="filterCat catName">${cat.title}</p>
      </div>
      </div>
      <div class="dropIcon">
        <i class="fa-solid fa-ellipsis dropBtnTag"></i>
        <ul class="dropdown">
          <li class="editTag">Edit ...</li>
          <li class="confrimDeleteTag">Delete</li>
        </ul>
    </li>`);
    });
  }
  // displayCategories();

  //tasks
  $("#addTask").click(function (e) {
    e.preventDefault();
    let validate = false;
    const taskTitle = $("#taskTitle").val().trim().toLowerCase();
    const taskText = $("#taskText").val().trim().toLowerCase();
    const checkTitle = tasks.find((item) => item.title === taskTitle);

    if (taskTitle === "") {
      $("#errorTitle").show();
      validate = false;
    } else if (checkTitle) {
      if (checkTitle.id === currentTaskId) {
        validate = true;
        $("#errorTitle").hide();
        $("#errorText").hide();
      } else {
        $("#errorTitle").html("Task already Exists");
        $("#errorTitle").show();
        validate = false;
      }
    } else if (taskText === "") {
      $("#errorText").show();
      validate = false;
    } else if (selectedTag.length === 0) {
      $("#errorTag").show();
      validate = false;
    } else {
      validate = true;
      $("#errorTitle").hide();
      $("#errorText").hide();
      $("#errorTag").hide();
    }

    if (validate) {
      if (currentTaskId === undefined) {
        $.ajax({
          url: `${baseUrl}/tasks`,
          method: "POST",
          data: {
            tag_id: selectedTag[0].id,
            title: taskTitle,
            content: taskText,
          },
          success: function (response) {
            $("#taskTitle").val("");
            $("#taskText").val("");
            selectedTag = [];
            getAllTasks();
            currentTaskId = undefined;
            close();
          },
          error: function (err) {
            console.log("addTask", err);
          },
        });
        // user.tasks.push({
        //   title: taskTitle,
        //   text: taskText,
        //   checked: false,
        //   category: selectedTag,
        // });
        // user.tasks.forEach((element, index) => (element.id = index));
      } else {
        $.ajax({
          url: `${baseUrl}/tasks/${currentTaskId}`,
          method: "PUT",
          data: {
            title: taskTitle,
            content: taskText,
          },
          success: function (response) {
            $("#taskTitle").val("");
            $("#taskText").val("");
            close();
            selectedTag = [];
            getAllTasks();
            currentTaskId = undefined;
          },
          error: function (err) {
            console.log("edit tasks", err);
          },
        });
      }
      getAllTags();
    }
  });
  function displayTasks(filter, isDone) {
    const display = $("#displayTasks");
    display.empty();

    let newTasks = [];

    function filterDone(item) {
      if (!item.hidden) {
        const itemExists = newTasks.find((task) => task === item);
        if (itemExists) {
          const newTask = newTasks.filter((nt) => nt !== item);
          newTasks = newTask;
        } else {
          newTasks.push(item);
        }
      }
    }

    if (isDone && filter === "") {
      tasks.forEach((item) => {
        filterDone(item);
      });
    } else if (filter !== "") {
      tasks.forEach((item) => {
        const categoryExists = categories?.find((cat) => cat.title === filter);
        if (categoryExists) {
          const taskExists = newTasks.find((task) => task === item);
          if (taskExists) {
            const newTask = newTasks.filter((nt) => nt !== item);
            newTasks = newTask;
          } else if (item.tag === filter && isDone) {
            filterDone(item);
          } else if (item.tag === filter) {
            newTasks.push(item);
          }
        } else {
          return;
        }
      });
    } else {
      newTasks = tasks;
    }

    // ${task.category
    //   .map((cat) => {
    //     return `<span class="catIcon" style="background: ${cat.color}"></span>`;
    //   })
    //   .join("")}
    newTasks.forEach((task) => {
      const tag = categories?.find((item) => item.title === task.tag);
      display.append(`<div class="card" data-id="${task.id}">
      <div class="cardTop flex justify-between">
        <h3 class="title ${task.completed && "checked"}">${task.title}</h3>
        <div class="dropIcon">
          <i class="fa-solid fa-ellipsis dropBtn"></i>
          <ul class="dropdown">
            <li class="edit">Edit ...</li>
            <li class="confrimDelete">Delete</li>
          </ul>
        </div>
      </div>
      <p class="text ${task.completed && "checked"}">
        ${task.content}
      </p>
      <div class="cardBottom flex justify-between">
      <div class="flex" style="gap: 10px">
        <span class="catIcon" style="background: ${tag?.color}"></span>
      </div>
        <div class="flex">
          <input type="checkbox" name="done" ${
            task.completed && "checked"
          } class="toggleDone" />
          <label class="doneLabel" for="done">Done</label>
        </div>
      </div>
    </div>`);
    });
  }
  // displayTasks(activeCategory, hideDone);
  function getAllTasks() {
    $.ajax({
      url: `${baseUrl}/tasks?user_id=${currentUser.id}`,
      method: "GET",
      contentType: "application/json",
      success: function (response) {
        // console.log(response);
        tasks = response;
        displayTasks(activeCategory, hideDone);
      },
      error: function (err) {
        console.log("addTag", err);
      },
    });
  }
  getAllTasks();

  // //tags in modal
  function displayTags(categories) {
    const display = $("#displayTags");
    display.empty();

    categories.forEach((cat) => {
      const tag = selectedTag.find((item) => item.title === cat.title);
      display.append(`<li class="flex tag ${tag && "activeTag"}">
      <span class="catIcon" style="background: ${cat.color}"></span>
      <p class="tagName catName">${cat.title}</p>
    </li>`);
    });
  }
  // displayTags();
  $(document).on("click", ".tagName", function () {
    const tag = $(this).closest(".tag");
    tag.toggleClass("activeTag");
    const catName = this.textContent;

    const cat = categories.find((item) => item.title === catName);
    if (cat) {
      const catExists = selectedTag.find((item) => item.title === cat.title);
      if (catExists) {
        const newCat = selectedTag.filter((item) => item.title !== cat.title);
        selectedTag = newCat;
      } else {
        selectedTag.unshift(cat);
      }
      // displayTags();
    }
  });

  //mark task as done
  $(document).on("click", ".toggleDone", function () {
    const closestId = $(this).closest(".card");
    const id = closestId.data("id");

    let task = tasks.find((item) => item.id === id);
    if (task) {
      $.ajax({
        url: `${baseUrl}/tasks/${id}/set-completed`,
        method: "PUT",
        data: {
          completed: !task.completed,
        },
        success: function (response) {
          // console.log(response);
          getAllTasks();
        },
        error: function (err) {
          console.log("toggleDone", err);
        },
      });
      // task.completed = !task.completed;
    }
  });

  //filter by category
  $(document).on("click", ".filterCat", function () {
    const cat = $(this).closest(".cat");
    // cat.toggleClass("activeTag");
    const catName = this.textContent;
    if (activeCategory === catName) {
      activeCategory = "";
      cat.removeClass("activeTag");
      displayTasks(activeCategory, hideDone);
      displayCategories(categories);
    } else {
      activeCategory = catName;
      displayCategories(categories);
      displayTasks(activeCategory, hideDone);
    }
  });

  //filter by done tasks
  $(document).on("click", "#hideDone", function () {
    hideDone = $("#hideDone")[0].checked;
    localStorage.setItem("hideDone", JSON.stringify({ value: hideDone }));
    tasks.forEach((item) => {
      $.ajax({
        url: `${baseUrl}/tasks/${item.id}/set-hidden`,
        method: "PUT",
        data: {
          hidden: item.completed && hideDone ? true : false,
        },
        success: function (response) {
          // console.log(response);
          // getAllTasks();
          getAllTasks();
        },
        error: function (err) {
          console.log("hide done", err);
        },
      });
      // task.completed = !task.completed;
    });

    // hideDone = !hideDone;
  });

  //toggle dropdown
  $(document).on("click", ".dropBtn", function () {
    const card = $(this).closest(".card");
    card.find(".dropdown").toggle();
  });
  $(document).on("click", ".dropBtnTag", function () {
    const cat = $(this).closest(".cat");
    cat.find(".dropdown").toggle();
  });

  // //edit task
  $(document).on("click", ".edit", function () {
    selectedTag = [];
    const closestId = $(this).closest(".card");
    const id = closestId.data("id");

    let task = tasks.find((item) => item.id === id);

    if (task) {
      const tag = categories?.find((cat) => cat.title === task.tag);
      $("#modal").show();
      $("#taskModal").show();
      $("#taskTitle").val(task.title);
      $("#taskText").val(task.content);
      selectedTag.push(tag);
      displayTags(categories);
      currentTaskId = id;
    }
  });
  $(document).on("click", ".delete", function () {
    // let newTasks = tasks.filter((item) => item.id !== currentTaskId);
    $.ajax({
      url: `${baseUrl}/tasks/${currentTaskId}`,
      method: "DELETE",
      success: function (response) {
        $("#modal").hide();
        $("#deleteModal").hide();
        getAllTasks();
      },
      error: function (err) {
        console.log("delete tasks", err);
      },
    });

    // currentTaskId = "";
  });
  $(document).on("click", ".editTag", function () {
    const closestId = $(this).closest(".cat");
    const id = closestId.data("id");

    let tag = categories.find((item) => item.id === id);

    if (tag) {
      $("#modal").show();
      $("#categoryModal").show();
      $("#categoryName").val(tag.title);
      currentTagId = id;
    }
  });
  $(document).on("click", ".deleteTag", function () {
    $.ajax({
      url: `${baseUrl}/tags/${currentTagId}`,
      method: "DELETE",
      success: function () {
        close();
        getAllTags();
        getAllTasks();
      },
      error: function (err) {
        console.log("delete tags", err);
      },
    });
  });
  $("#logout").click(function () {
    localStorage.removeItem("currentUser");
    $(location).prop("href", "index.html");
  });
});

// $(".toggleDone").change(function (e) {
//   const id = parseInt(e.target.attributes.id.value);
//   let task = tasks.find((item) => item.id === id);
//   if (task) {
//     task.checked = !task.checked;
//   }
//   if (task.checked) {
//     $(".text").addClass("checked");
//   } else {
//     $(".text").removeClass("checked");
//   }
// });

// var urlParms = new URLSearchParams(window.location.search);
// var id = urlParms.get("id")
