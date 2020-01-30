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
const contractAddress ='ct_2mJbZVGztFg8tLgLhyXh7TLtYMKxquM8nVjAT8McVTkoagiDDe';
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

$('.modal-body').on('click', '#checkInBtn', async function () {
  console.log("Adding car to the blockchain")
  // event.preventDefault();
  console.log("Adding car to the blockchain")

  
  // const keys = ['Lisence_no', 'owner_name', 'nameOfCar', 'd_o_a', 'image', 'slot']

  const Lisence_no = $('#Lisence_no').val()
  
  owner_name = ($('#owner_name').val());
  nameOfCar = ($('#nameOfCar').val());

  image = ($('#image').val())

  


 
  console.log(image)

  await contractCall("addCar", [nameOfCar, owner_name, image, Lisence_no], 0)

  const carId = await callStatic('getTotalCars', [])

  const newCar = await callStatic('getCar', [carId])
  CarArray.push({
    id     : newCar.id,
    owner           : newCar.owner,
    nameOfCar          : newCar.nameOfCar,
    image :car.image,
    nameOfOwner          : newCar.nameOfOwner,
    lisencePlate            : newCar.lisencePlate,
    entryDate: Date(newCar.entryDate),
    exitDate : 0,
    checkedOut : newCar.checkedOut
  })

  console.log("added")

  renderCars()

})


$('#cars').on('click', '.checkOutBtn', async function (event) {
  console.log("Checking out")
 
  
 
  // const Lisence_no = $('#Lisence_no').val()
  
  // owner_name = ($('#owner_name').val());
  // nameOfCar = ($('#nameOfCar').val());

  // image = ($('#image').val())

  // console.log(image)

  index = event.target.id
  console.log("index", index)

  // const foundIndex = CarArray.findIndex(car => car.index == event.target.id);
  // console.log("Found index", Math.abs(foundIndex))
  // CarArray[Math.abs(foundIndex)].checkedOut = true;


  console.log(index)
  await contractCall("checkOut", [index], 100000)

  // const checkedOut = await callStatic('getCar', [index])

  // const checkOutDate = checkedOut.exitDate
  // console.log("Check out date ",checkOutDate )

  // CarArray[Math.abs(foundIndex)].exitDate = Date();

  // console.log(checkedOut)

  location.reload()
  console.log("checked out")

  renderCars()

})
