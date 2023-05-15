/*---------------------------------- adding user ----------------------------------------*/

$("#add_user").submit(function (event) {
  event.preventDefault();
  let unindexed_array = $(this).serializeArray();
  console.log(unindexed_array);
  let data = {};
  $.map(unindexed_array, function (n, i) {
    data[n["name"]] = n["value"];
  });
  console.log(data);

  // Validate name input
  const nameRegex = /^[a-zA-Z ]{2,30}$/; // Regular expression to match alphabetic characters and spaces, between 2 and 30 characters long
  if (!nameRegex.test(data.name)) {
    alert("Name must be between 2 and 30 alphabetic characters");
    return;
  }

  // Validate email input
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to match valid email format
  if (!emailRegex.test(data.email)) {
    alert("Invalid email format");
    return;
  }
  let request = {
    url: "http://127.0.0.1:3000/api/users",
    method: "POST",
    data: data,
  };
  $.ajax(request).done(function (response) {
    alert("Data Inserted Successfully!");
  });
});

/*------------------------------ updating user ---------------------------------------*/

$("#update_user").submit(function (event) {
  event.preventDefault();
  let unindexed_array = $(this).serializeArray();
  console.log(unindexed_array);
  let data = {};
  $.map(unindexed_array, function (n, i) {
    data[n["name"]] = n["value"];
  });
  console.log(data);

  // Validate name input
  const nameRegex = /^[a-zA-Z ]{2,30}$/; // Regular expression to match alphabetic characters and spaces, between 2 and 30 characters long
  if (!nameRegex.test(data.name)) {
    alert("Name must be between 2 and 30 alphabetic characters");
    return;
  }

  // Validate email input
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to match valid email format
  if (!emailRegex.test(data.email)) {
    alert("Invalid email format");
    return;
  }

  let request = {
    url: `http://127.0.0.1:3000/api/users/${data.id}`,
    method: "PUT",
    data: data,
  };
  $.ajax(request).done(function (response) {
    alert("Data Updated Successfully!");
  });
});

   /*----------------  delete request -------------------------------------------*/

if (window.location.pathname == "/") {
  $ondelete = $(".table tbody td a.delete");
  $ondelete.click(function () {
    let id = $(this).attr("data-id");
    let request = {
      url: `http://127.0.0.1:3000/api/users/${id}`,
      method: "DELETE",
    };
    if (confirm("Do you really want to delete this record?")) {
      $.ajax(request).done(function (response) {
        alert("Data Deleted Successfully!");
        location.reload();
      });
    } else {
      alert("not permitted!!");
    }
  });
}
