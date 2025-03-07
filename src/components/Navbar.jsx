import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedModal, setLoggedModal] = useState(false);
  const [loggedModalPosition, setLoggedModalPosition] = useState({ top: 0, left: 0 });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const userData = JSON.parse(localStorage.getItem("user"))
console.log(userData)

  const registerUser = async (e) => {
    e.preventDefault();

    console.log(name, email, password, passwordConfirmation);
    

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email, 
            password: password,
            password_confirmation: passwordConfirmation
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Salva il token nel local storage o nei cookie
        localStorage.setItem("token", data.token);
        setIsRegistrationOpen(false);
  
        // Esegui altre azioni necessarie, come redirigere l'utente
        console.log("Utente registrato e loggato!");
      } else {
        console.error(data.errors || "Errore nella registrazione");
      }



        // ✅ Chiudi il modal e svuota i campi dopo la registrazione
        setName("");
        setEmail("");
        setPassword("");

    
    } catch (error) {
      console.error("Errore:", error.message);
    }
  }
  
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      // 1. Effettua la richiesta di login
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // 2. Salva il token nel localStorage
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("storage"));

  
        // 3. Recupera i dati dell'utente
        const userResponse = await fetch("http://127.0.0.1:8000/api/user", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${data.token}`, // Passa il token nel header
            "Content-Type": "application/json",
          },
        });
  
        const userData = await userResponse.json();
  
        if (userResponse.ok) {
          // 4. Salva i dati dell'utente nel localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          // 5. Aggiorna lo stato dell'autenticazione
          setIsAuthenticated(true);
          setIsLoginOpen(false);
  
          console.log("Utente loggato!", userData);
        } else {
          console.error("Errore nel recupero dei dati utente");
        }
  
        // ✅ Chiudi il modal e svuota i campi dopo la registrazione
        setName("");
        setEmail("");
        setPassword("");
      } else {
        console.error(data.errors || "Errore nel login");
      }
    } catch (error) {
      console.error("Errore:", error.message);
    }
  };
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(token !== null);
  }, [isAuthenticated]);

  const logoutUser = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.error("Nessun token trovato, utente già disconnesso.");
        return;
      }
  
      const response = await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        console.log("Logout riuscito!");
        localStorage.removeItem("token"); // ✅ Rimuove il token SOLO dopo il logout riuscito
        window.location.reload(); // Facoltativo: ricarica la pagina per aggiornare lo stato
      } else {
        console.error("Errore durante il logout");
      }
    } catch (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  const openLoggedModal = (event) => {
    setLoggedModal(!loggedModal);
    
    const rect = event.currentTarget.getBoundingClientRect(); // Ottieni la posizione del bottone
    console.log(event.currentTarget.getBoundingClientRect()) 

    setLoggedModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right - (70),
    }); 
  };
  
  return (
    <>

      <nav id="navbar" className="grid grid-cols-3 items-center px-5">
        <div></div>
        <div className="flex justify-center">
          <img src={logo} alt="logo crypto world" />
        </div>
       
        {!isAuthenticated ?
          <button className="text-right" onClick={() => {setIsLoginOpen(true)}}>
          Login
        </button> : 
          <button className="text-right" onClick={(e) => openLoggedModal(e)}>
          <FontAwesomeIcon icon={faUser} />
        </button>
        }

        {loggedModal && <div id="modal-portfolio-token" style={{position: "absolute", top: `${loggedModalPosition.top}px`, left: `${loggedModalPosition.left}px`}}>
          <ul>
          <Link to="/settings">
          <li> {userData.name}
          </li>
          </Link>
            <li onClick={logoutUser}>Logout</li>
          </ul>
        </div>
        }
      </nav>


      {isLoginOpen && (
        <div
          id="login-modal"
          className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <div className="flex justify-between mb-4 items-center grid-cols-3">
              <h2 className="text-xl font-bold">Login</h2>
              <button
                type="button"
                className="pointer"
                onClick={() => setIsLoginOpen(false)}>
                x
              </button>
            </div>

            {/* Form per inserire i dati */}
            <form onSubmit={loginUser}>
              <div className="mb-3">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="text"
                  className="mt-1 p-2 ps-8 w-full border rounded-md"  
                  onChange={(e) => setEmail(e.target.value)}              
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 p-2 w-full border rounded-md"
                  onChange={(e) => setPassword(e.target.value)}
                />
            
              </div>
            
              <div>
                <p>
                  Not registered? 
                  <span onClick={() => {setIsRegistrationOpen(true); setIsLoginOpen(false)}}>
                    Click here
                  </span>
                </p>
              </div>



              
          

              <div className="flex justify-end">
                <button
                  type="submit"
                  style={{ backgroundColor: "#16c784" }}
                  className="pointer px-4 py-2 text-white rounded-md"
               >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRegistrationOpen && (
         <div
         id="login-modal"
         className="fixed inset-0 flex items-center justify-center">
         <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
           <div className="flex justify-between mb-4 items-center grid-cols-3">
             <h2 className="text-xl font-bold">Registrazione</h2>
             <button
               type="button"
               className="pointer"
               onClick={() => setIsRegistrationOpen(false)}>
               x
             </button>
           </div>

           {/* Form per inserire i dati */}
           <form onSubmit={registerUser}>
           <div className="mb-3">
               <label className="block text-sm font-medium">Name</label>
               <input
                 type="text"
                 className="mt-1 p-2 ps-8 w-full border rounded-md"
                 onChange={(e) => setName(e.target.value)}                
               />
             </div>
             <div className="mb-3">
               <label className="block text-sm font-medium">Email</label>
               <input
                 type="text"
                 className="mt-1 p-2 ps-8 w-full border rounded-md"   
                 onChange={(e) => setEmail(e.target.value)}             
               />
             </div>

             <div className="mb-3">
               <label className="block text-sm font-medium text-gray-700">
                 Password
               </label>
               <input
                 type="password"
                 className="mt-1 p-2 w-full border rounded-md"
                 onChange={(e) => setPassword(e.target.value)}
               />
           
             </div>
             <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                  type="password"
                  className="mt-1 p-2 w-full border rounded-md"
                />
            
              </div>
             <div>
               <p>
                 Already registered? 
                 <span onClick={() => {setIsRegistrationOpen(false); setIsLoginOpen(true)}}>
                   Click here
                 </span>
               </p>
             </div>

             
         

             <div className="flex justify-end">
               <button
                 type="submit"
                 style={{ backgroundColor: "#16c784" }}
                 className="pointer px-4 py-2 text-white rounded-md"
              >
                 Register
               </button>
             </div>
           </form>
         </div>
       </div>
      )}
    </>
  );
}
