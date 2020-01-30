const contractSource = `
payable contract ParkingLot =   
    type i = int
    type s = string
    type a = address
    type b = bool

    record car = {
        id : i,
        owner : a,
        nameOfCar	  : s,
        nameOfOwner : s,
        image : s,
        lisencePlate	  : s,
        entryDate : i,
        exitDate : i,
        checkedOut : b
         }

    record owner = {
        owner : a,
        nameOfOwner : s
        }
   
    record state = 
        { cars : map(i, car),
        checkedInOwners : map(address, owner)}
 
    entrypoint init() = {
        cars = {},
        checkedInOwners = {}}

    entrypoint getCar(index : i) : car = 
        switch(Map.lookup(index, state.cars))
            None  => abort("There is no Cars with that ID.")
            Some(x) => x  

    stateful entrypoint addCar(nameOfCar' : s,nameOfOwner' : s, image' :s, lisencePlate' : s) = 

        // Ensures the user has not already registered a car
        require(!Map.member(Call.caller, state.checkedInOwners), "You are already checked in")
        let index = getTotalCars() + 1
        let car = {id= index,  
            owner  = Call.caller,
            nameOfCar = nameOfCar',
            nameOfOwner = nameOfOwner',
            image = image',
            lisencePlate =  lisencePlate',
            entryDate = Chain.timestamp,
            exitDate = 0,
            checkedOut = false   }

        let checkedInOwner = {
            owner = Call.caller,
            nameOfOwner = nameOfOwner'

            }
        put(state {cars[index] = car})
        put(state {checkedInOwners[Call.caller] = checkedInOwner})

    private stateful function deleteUser() =
          put(state{ checkedInOwners @ c = Map.delete(Call.caller, c) })

    private stateful function updateCheckOutState(index : i) = 

        let user  = getCar(index)

        let updated = !user.checkedOut
        put(state{cars[index].checkedOut = updated })


    stateful payable entrypoint checkOut(index : i) = 
        let carToCheckOut = getCar(index)
        require(carToCheckOut.checkedOut != true, "This car has already been checkout out")
        Chain.spend(Contract.address, 100000)

        updateCheckOutState(index)
        // Removes the user from the record
        deleteUser()
        
        
        let updateDate = state.cars[index].entryDate
        
        put(state{cars[index].exitDate = updateDate + Chain.block_height  })

    entrypoint getTotalCars() : i = 
        Map.size(state.cars)

        

        

        
        


`;
const contractAddress ='ct_aYYjV1TuDWH1zpbSsz6UQ6kCJNY7jDmXcdPFcUjQFX1P8vgKG';
var client = null;
var CarArray = [];



async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });

  const calledGet = await contract
    .call(func, args, {
      callStatic: true
    })
    .catch(e => console.error(e));

  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log("number of posts : ", decodedGet);
  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract
    .call(func, args, {
      amount: value
    })
    .catch(e => console.error(e));

  return calledSet;
}
function renderCars()
{
    // CarArray = CarArray.sort(function(a,b){return b.Price - a.Price})
    var template = $('#template').html();
    
    Mustache.parse(template);
    var rendered = Mustache.render(template, {CarArray});

    
  

    $('#cars').html(rendered);
    console.log("for loop reached")
}


window.addEventListener('load', async () => {
  //   $("#loader").show();
  
    client = await Ae.Aepp();
  
    totalCar =  await callStatic('getTotalCars', [])
    console.log(totalCar)
  
    for (let i = 1; i <= totalCar; i++) {
  
     
      const car = await callStatic('getCar', [i])
      console.log(car)
      console.log("This is the cars exit date : ", car.exitDate)
  
      CarArray.push({
        id     : car.id,
        owner           : car.owner,
        nameOfCar          : car.nameOfCar,
        image :car.image,
        nameOfOwner          : car.nameOfOwner,
        lisencePlate            : car.lisencePlate,
        entryDate: Date(car.entryDate),
        exitDate : 0,
        checkedOut : car.checkedOut
      })

      renderCars();
    }
  
    
    
  
  //   $("#loader").hide();
  });
  console.log("Finished")

/**
 * Initiate the app at the beginning
 */
(function mounted() {
  getTableData()
  $('#d_o_a').datepicker({
    changeMonth: true,
    changeYear: true,
    yearRange: '1900:2200',
    dateFormat: 'dd-mm-yy'
  })
  $('#edit_d_o_a').datepicker({
    changeMonth: true,
    changeYear: true,
    yearRange: '1900:2200',
    dateFormat: 'dd-mm-yy'
  })
})()
/**
 * Generating unique ID for new Input
 */
function guid() {
  return parseInt(Date.now() + Math.random())
}
/**
 * Create and Store New Member
 */


var el = document.querySelector('#saveMemberInfo');
if (el) {
    el.addEventListener('submit', saveMemberInfo);
}
async function saveMemberInfo(event) {
  console.log("Adding car to the blockchain")

  console.log(keys[1])
  event.preventDefault();
  const keys = ['Lisence_no', 'owner_name', 'nameOfCar', 'd_o_a', 'image', 'slot']
  
  await contractCall("addCar", [keys[2],keys[1],keys[4],keys[0]], 0)
  console.log("added")

  renderCars()
  const obj = {}
  keys.forEach((item, index) => {
    const result = document.getElementById(item).value
    if (result) {
      obj[item] = result;
    }
  })
  var members = getMembers()
  members.forEach((item) => {
    if (obj.slot === item.slot) {
      if (obj.d_o_a === item.d_o_a) {
        alert("Can't allocate slot. Slot is not availabe on the selected day.");
        window.location.reload();
        this.preventDefault();
        return false;
      }
    }
  })
  if (!members.length) {
    $('.show-table-info').addClass('hide')
  }
  if (Object.keys(obj).length) {
    var members = getMembers()
    obj.id = guid()
    members.push(obj)
    const data = JSON.stringify(members)
    localStorage.setItem('members', data)
    el.reset()
    insertIntoTableView(obj, getTotalRowOfTable())
    $('#addnewModal').modal('hide')
  }
}
/**
 * Clear Create New Member Form Data0
 */
function clearFields() {
  $('#input_form')[0].reset()
}
/**
 * Get All Members already stored into the local storage
 */
function getMembers() {
  const memberRecord = localStorage.getItem('members')
  let members = []
  if (!memberRecord) {
    return members
  } else {
    members = JSON.parse(memberRecord)
    return members
  }
}
/**
 * Populating Table with stored data
 */
function getTableData() {
  $('#member_table').find('tr:not(:first)').remove()
  const searchKeyword = $('#member_search').val()
  const members = getMembers()
  const filteredMembers = members.filter(({
    Lisence_no,
      owner_name,
      nameOfCar,
      d_o_a,
      slot
    }, index) => Lisence_no.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    owner_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    nameOfCar.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    d_o_a.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    slot.toLowerCase().includes(searchKeyword.toLowerCase()))
  if (!filteredMembers.length) {
    $('.show-table-info').removeClass('hide')
  } else {
    $('.show-table-info').addClass('hide')
  }
  filteredMembers.forEach((item, index) => {
    insertIntoTableView(item, index + 1)
  })
}
/**
 * Inserting data into the table of the view
 *
 * @param {object} item
 * @param {int} tableIndex
 */
function insertIntoTableView(item, tableIndex) {
  const table = document.getElementById('member_table')
  const row = table.insertRow()
  const idCell = row.insertCell(0)
  const firstNameCell = row.insertCell(1)
  const lastNameCell = row.insertCell(2)
  const nameOfCarCell = row.insertCell(3)
  const dateOfBirthCell = row.insertCell(4)
  const slotCell = row.insertCell(5)
  const actionCell = row.insertCell(6)
  idCell.innerHTML = tableIndex
  firstNameCell.innerHTML = item.Lisence_no
  lastNameCell.innerHTML = item.owner_name
  nameOfCarCell.innerHTML = item.nameOfCar
  dateOfBirthCell.innerHTML = item.d_o_a
  slotCell.innerHTML = `<span class="tag">${item.slot}</span>`
  const guid = item.id
  actionCell.innerHTML = `<button class="btn btn-sm btn-secondary" onclick="showMemberData(${guid})">View</button> <button class="btn btn-sm btn-primary" onclick="showEditModal(${guid})">Edit</button> <button class="btn btn-sm btn-danger" onclick="showDeleteModal(${guid})">Delete</button>`
}
/**
 * Get Total Row of Table
 */
function getTotalRowOfTable() {
  const table = document.getElementById('member_table')
  return table.rows.length
}
/**
 * Show Single Member Data into the modal
 *
 * @param {string} id
 */
function showMemberData(id) {
  const allMembers = getMembers()
  const member = allMembers.find(item => item.id == id)
  $('#show_reg_no').val(member.Lisence_no)
  $('#show_owner_name').val(member.owner_name)
  $('#show_email').val(member.nameOfCar)
  $('#show_d_o_a').val(member.d_o_a)
  $('#show_slot').val(member.slot)
  $('#showModal').modal()
}
/**
 * Show Edit Modal of a single member
 *
 * @param {string} id
 */
function showEditModal(id) {
  const allMembers = getMembers()
  const member = allMembers.find(item => item.id == id)
  $('#edit_reg_no').val(member.Lisence_no)
  $('#edit_owner_name').val(member.owner_name)
  $('#edit_email').val(member.nameOfCar)
  $('#edit_d_o_a').val(member.d_o_a)
  $('#edit_slot').val(member.slot)
  $('#member_id').val(id)
  $('#editModal').modal()
}
/**
 * Store Updated Member Data into the storage
 */
function updateMemberData() {
  if ($('#edit_reg_no').val() == '' || $('#edit_owner_name').val() == '' || $('#edit_email').val() == '' || $('#edit_d_o_a').val() == '' || $('#edit_slot').val() == '') {
    alert("All fields are required");
    window.location.reload();
    this.preventDefault();
    return false;
  }
  var members = getMembers()
  members.forEach((item) => {
    if ($('#edit_slot').val() === item.slot) {
      if ($('#edit_d_o_a').val() === item.d_o_a) {
        alert("Can't allocate slot. Slot is not availabe on the selected day.");
        window.location.reload();
        this.preventDefault();
        return false;
      }
    }
  })
  const allMembers = getMembers()
  const memberId = $('#member_id').val()
  const member = allMembers.find(({
    id
  }) => id == memberId)
  member.Lisence_no = $('#edit_reg_no').val()
  member.owner_name = $('#edit_owner_name').val()
  member.nameOfCar = $('#edit_email').val()
  member.d_o_a = $('#edit_d_o_a').val()
  member.slot = $('#edit_slot').val()
  const data = JSON.stringify(allMembers)
  localStorage.setItem('members', data)
  $('#member_table').find('tr:not(:first)').remove()
  getTableData()
  $('#editModal').modal('hide')
}
/**
 * Show Delete Confirmation Dialog Modal
 *
 * @param {int} id
 */
function showDeleteModal(id) {
  $('#deleted-member-id').val(id)
  $('#deleteDialog').modal()
}
/**
 * Delete single member
 */
function deleteMemberData() {
  const id = $('#deleted-member-id').val()
  const allMembers = getMembers()
  const storageUsers = JSON.parse(localStorage.getItem('members'))
  let newData = []
  newData = storageUsers.filter((item, index) => item.id != id)
  const data = JSON.stringify(newData)
  localStorage.setItem('members', data)
  $('#member_table').find('tr:not(:first)').remove()
  $('#deleteDialog').modal('hide')
  getTableData()
}
/**
 * Sorting table data through type, e.g: Lisence_no, nameOfCar, owner_name etc.
 *
 * @param {string} type
 */
function sortBy(type) {
  $("#member_table").find("tr:not(:first)").remove();
  var totalClickOfType = parseInt(localStorage.getItem(type));
  if (!totalClickOfType) {
    totalClickOfType = 1;
    localStorage.setItem(type, totalClickOfType);
  } else {
    if (totalClickOfType == 1) {
      totalClickOfType = 2;
    } else {
      totalClickOfType = 1;
    }
    localStorage.setItem(type, totalClickOfType);
  }
  var searchKeyword = $('#member_search').val();
  var members = getMembers();
  var sortedMembers = members.sort(function (a, b) {
    return (totalClickOfType == 2) ? a[type] > b[type] : a[type] < b[type];
  });
  sortedMembers.forEach(function (item, index) {
    insertIntoTableView(item, index + 1);
  })
}
