// const contractSource = `
// payable contract ParkingLot =   
//     type i = int
//     type s = string
//     type a = address
//     type b = bool

//     record car = {
//         id : i,
//         owner : a,
//         nameOfCar	  : s,
//         nameOfOwner : s,
//         lisencePlate	  : s,
//         entryDate : i,
//         exitDate : i,
//         checkedOut : b
//          }
   
//     record state = 
//         { cars : map(i, car),
//         totalCars : i}
 
//     entrypoint init() = {
//         cars = {},
//         totalCars = 0 }

//     entrypoint getCar(index : i) : car = 
//         switch(Map.lookup(index, state.cars))
//             None  => abort("There is no Cars with that ID.")
//             Some(x) => x  

//     stateful entrypoint addCar(nameOfCar' : s,nameOfOwner' : s, lisencePlate' : s) = 
       
//         let index = getTotalCars() + 1
//         let car = {id= index,  
//             owner  = Call.caller,
//             nameOfCar = nameOfCar',
//             nameOfOwner = nameOfOwner',
//             lisencePlate =  lisencePlate',
//             entryDate = Chain.timestamp,
//             exitDate = 0,
//             checkedOut = false   }
//         put(state {cars[index] = car, totalCars = index})

//     stateful payable entrypoint checkOut(index : i) = 
//         let carToCheckOut = getCar(index)
//         require(carToCheckOut.checkedOut != true, "This car has already been checkout out")
//         Chain.spend(Contract.address, 100000)
        
//         let updateDate = state.cars[index].entryDate
//         put(state{cars[index].exitDate = updateDate + Chain.block_height, cars[index].checkedOut = true   })

//     entrypoint getTotalCars() : i = 
//         state.totalCars

        


// `;
// const contractAddress ='ct_294UySW9KtaKAZvZHMVC4NYVAfqQWZK4uihvEC9FtxjcR4hGff';
// var client = null;
// var CarArray = [];


// function renderCars() {
//     //   CarArray = CarArray.sort((x, y) => y.Amount - x.Amount);
//       let template = $('#template').html();
//       Mustache.parse(template);
//       let rendered = Mustache.render(template, {CarArray});
//       $('#carBody').html(rendered);
//     }
    
//     async function callStatic(func, args) {
//       //Create a new contract instance that we can interact with
//       const contract = await client.getContractInstance(contractSource, {
//         contractAddress
//       });
    
//       const calledGet = await contract
//         .call(func, args, {
//           callStatic: true
//         })
//         .catch(e => console.error(e));
    
//       const decodedGet = await calledGet.decode().catch(e => console.error(e));
//       console.log("number of posts : ", decodedGet);
//       return decodedGet;
//     }
    
//     async function contractCall(func, args, value) {
//       const contract = await client.getContractInstance(contractSource, {
//         contractAddress
//       });
//       //Make a call to write smart contract func, with aeon value input
//       const calledSet = await contract
//         .call(func, args, {
//           amount: value
//         })
//         .catch(e => console.error(e));
    
//       return calledSet;
//     }

//     window.addEventListener('load', async () => {
//         //   $("#loader").show();
        
//           client = await Ae.Aepp();
        
//           totalCar =  await callStatic('getTotalCars', [])
//           console.log(totalCar)
        
//           for (let i = 1; i <= totalCar; i++) {
        
           
//             const car = await callStatic('getCar', [i])
//             console.log(car)
//             console.log("This is the cars exit date : ", car.exitDate)
        
//             CarArray.push({
//               id     : car.id,
//               owner           : car.owner,
//               nameOfCar          : car.nameOfCar,
//               nameOfOwner          : car.nameOfOwner,
//               lisencePlate            : car.lisencePlate,
//               entryDate: Date(car.entryDate),
//               exitDate : 0
//             })

//             renderCars();
//           }
        
          
          
        
//         //   $("#loader").hide();
//         });
//         console.log("Finished")
        
//         // $("#carBody").click(".checkOut", async function (event) {
//         //   // $("#loader").show();
//         //   console.log("checking out")
          
//         //       var index = event.target.id;
//         //       console.log(index)
        
        
//         //   await contractCall('checkOut', [index], 0 )
          
        
//         //   // const car = await callStatic('getCar', [index])
//         //   //   console.log(car)
//         //   //   console.log("This is the cars exit date : ", car.exitDate)
        
//         //     // CarArray.push({
//         //     //   id     : car.id,
//         //     //   owner           : car.owner,
//         //     //   nameOfCar          : car.nameOfCar,
//         //     //   nameOfOwner          : car.nameOfCar,
//         //     //   lisencePlate            : car.lisencePlate,
//         //     //   entryDate: Date(car.entryDate),
//         //     //   exitDate : Date(car.exitDate)
//         //     // })
        
//         //     renderCars()
//         //   }
          
         
//         // )
        
//         // Register Car
//         $('#btnOne').click(async function () {
//           // e.preventDefault()
//           console.log("Saving car")
//           // $("#loadings").show();
        
//           var name = ($('#owner').val()),
        
//           car = ($('#car').val());
        
//           lisencePlates = ($('#lisencePlate').val());
        
//           console.log(car)
//           console.log(name)
        
//           await contractCall("addCar", [car,name,lisencePlates], 0)
        
//           var index  = await callStatic('getTotalCars', [])
        
//           const newCar = await callStatic('getCar', [index])
//             console.log(newCar)
//             console.log("This is the new cars exit date : ", newCar.exitDate)
        
//             CarArray.push({
//               id     : newCar.id,
//               owner           : newCar.owner,
//               nameOfCar          : newCar.nameOfCar,
//               nameOfOwner          : newCar.nameOfOwner,
//               lisencePlate            : newCar.lisencePlate,
//               entryDate: Date(newCar.entryDate),
//               exitDate : newCar.exitDate
//             })
//           renderCars()
        
//         });