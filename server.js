const mysql = require("mysql");
const inquirer = require("inquirer");

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "dept_store_db",
});

connection.connect(function (err) {
  if (err) throw err;

  start();


});
function start() {
  inquirer
    .prompt({
      name: "userInput",
      type: "list",
      message:
        "Would you like to view [VIEW DEPARTMENTS], [VIEW ROLES], [VIEW_EMPLOYEES_BY_MANAGER], [VIEW EMPLOYEES], [ADD DEPARTMENTS], [ADD ROLES], [ADD EMPLOYEES], [UPDATE EMPLOYEE ROLE] [EXIT]?",
      choices: ["VIEW_DEPARTMENTS", "VIEW_ROLES", "VIEW_EMPLOYEES", "VIEW_EMPLOYEES_BY_MANAGER", "ADD_DEPARTMENTS", "ADD_ROLES", "ADD_EMPLOYEES", "UPDATE_EMPLOYEE_ROLE", "EXIT"],
    })
    .then(function (answer) {
      if (answer.userInput === "VIEW_DEPARTMENTS") {
        viewDepartments();
      } else if (answer.userInput === "VIEW_ROLES") {
        viewRoles();
      } else if (answer.userInput === "VIEW_EMPLOYEES") {
        viewEmployees();
      } else if (answer.userInput === "ADD_DEPARTMENTS") {
        addDepartment();
      } else if (answer.userInput === "ADD_ROLES") {
        addRole();
      } else if (answer.userInput === "ADD_EMPLOYEES") {
        addEmployee();
      } else if (answer.userInput === "UPDATE_EMPLOYEE_ROLE") {
        update_Employee();
      } else if (answer.userInput === "VIEW_EMPLOYEES_BY_MANAGER") {
        viewByManager();
      } else {
        connection.end();
      }

    });
}

function viewDepartments() {
  connection.query("SELECT * FROM department", function (err, results) {
    if (err) throw err;
    console.table(results);
    start();
  });
}
/*`select title, salary, name from role 
    inner join department on role.department_id=department.id */
function viewRoles() {
  connection.query(
    `select * from role`,
    function (err, results) {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
}
// select first_name, last_name, title, salary, name from employee 
//     inner join role on employee.role_id=role.id 
//     inner join department on role.department_id=department.id
function viewEmployees() {
  connection.query(
    `select * from employee`,
    function (err, results) {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
}

function printResults(err, result) {
  if (err) throw err;
  console.table(result);
  start();
}

async function addDepartment() {

  const department = await inquirer.prompt([
    {
      name: "name",
      message: "What is the name of the department"
    }
  ])

  connection.query(`insert into department (name) values ('${department.name}')`, printResults)
}

function addRole() {
  connection.query("select * from department", async function (err, results) {

    const departments = results.map((result) => ({
      name: result.name,
      value: result.id
    }))

    const roleInfo = await inquirer.prompt([
      {
        name: "title",
        message: "What is the title for the position"
      },
      {
        name: "salary",
        message: "What is the salary for the position"
      },
      {
        type: "list",
        name: "department_id",
        message: "Which Department does the role belong to?",
        choices: departments
      }
    ])

    connection.query(`insert into role (title, salary, department_id) values('${roleInfo.title}','${roleInfo.salary}','${roleInfo.department_id}' )`, printResults)

  })
}

function addEmployee() {
  connection.query("select * from role", async function (err, results) {

    const roles = results.map((result) => ({
      name: result.title,
      value: result.id
    }))

    const employeeInfo = await inquirer.prompt([
      {
        name: "first_name",
        message: "What is the first name of the employee"
      },
      {
        name: "last_name",
        message: "What is the last name of the employee"
      },
      {
        type: "list",
        name: "role_id",
        message: "What is the employee's role?",
        choices: roles
      }
    ])

    connection.query(`insert into employee (first_name, last_name, role_id) values('${employeeInfo.first_name}','${employeeInfo.last_name}','${employeeInfo.role_id}' )`, printResults)

  })
}

function viewByManager() {

  connection.query("SELECT * FROM manager", async function (err, managers) {

    // traverse this array and return key/value pairs for each index
    const managerChoices = managers.map(manager => ({
      name: manager.first_name + ' ' + manager.last_name,
      id: manager.id
    }))

    const managerList = await inquirer.prompt([
      {
        type: "list",
        name: "managerList",
        message: "Which manager do you want to see all the employees off?",
        choices: managerChoices
      }
    ])

    connection.query(`SELECT * FROM employee WHERE manager_id=${1}`, printResults);
  })

}

function update_Employee() {

  connection.query("select * from employee", function (err, employees) {

    connection.query("select * from role", async function (err, roles) {

      const roleChoices = roles.map((role) => ({
        name: role.title,
        value: role.id
      }))

      const employeeChoices = employees.map((employee) => ({
        name: employee.first_name + " " + employee.last_name,
        value: employee.id
      }))

      const updateEmployee = await inquirer.prompt([
        {
          type: "list",
          name: "employee_id",
          message: "Which employee would you like to udate?",
          choices: employeeChoices
        },
        {
          type: "list",
          name: "role_id",
          message: "What would you like their new role to be?",
          choices: roleChoices
        }
      ])

      connection.query(`update employee set role_id=${updateEmployee.role_id} where id=${updateEmployee.employee_id}`, printResults)

    })

  })

}


