import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
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
  const [loginErrors, setLoginErrors] = useState(false)
  const { register , formState: { errors }, watch, handleSubmit } = useForm();
  const password = watch('registrationPassword', '');

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  console.log(loggedUser)


  const registerUser = async (formData) => {
    console.log(formData);
    
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.registrationName,
            email: formData.registrationEmail, 
            password: formData.registrationPassword,
            password_confirmation: formData.registrationPasswordConfirmation
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Salva il token nel local storage o nei cookie
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsRegistrationOpen(false);
        setIsAuthenticated(true);

        window.dispatchEvent(new Event("storage"));
  
        // Esegui altre azioni necessarie, come redirigere l'utente
        console.log("Utente registrato e loggato!");
      } else {
        console.error(data.errors || "Errore nella registrazione");
      }
    } catch (error) {
      console.error("Errore:", error.message);
    }
  }
  
  //   let isValid = true;
  //   const newErrors = { email: "", password: "" };

  //   // Validazione email
  //   if (!email) {
  //     newErrors.email = "L'email è obbligatoria";
  //     isValid = false;
  //   } else if (!/\S+@\S+\.\S+/.test(email)) {
  //     newErrors.email = "Inserisci un'email valida";
  //     isValid = false;
  //   }

  //   // Validazione password
  //   if (!password) {
  //     newErrors.password = "La password è obbligatoria";
  //     isValid = false;
  //   } else if (password.length < 6) {
  //     newErrors.password = "La password deve contenere almeno 6 caratteri";
  //     isValid = false;
  //   }

  //   setLoginErrors(newErrors);
  //   window.dispatchEvent(new Event("storage"));

  //   return isValid;
  // };

  const loginUser = async (formData) => {
    console.log("login partito", formData)
    setLoginErrors(false);

    try {
      // 1. Effettua la richiesta di login
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.loginEmail,
          password: formData.loginPassword,
        }),
      });
  
      const data = await response.json();
      console.log('dati al login:', data);
  
      if (response.ok && data.user && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));


        setIsAuthenticated(true);
        setIsLoginOpen(false);

        window.dispatchEvent(new Event("storage"));

        setLoginErrors([]);
      } else {
        console.error(data.errors || "Errore nel login");

      }
    } catch (error) {
      console.error("Errore:", error.message);
      setLoginErrors(true);
    }
  };
  
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.reload(); 
        useNavigate("/")

      } else {
        console.error("Errore durante il logout");
      }
    } catch (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(token !== null);
  }, [isAuthenticated]);

  const openLoggedModal = (event) => {
    setLoggedModal(!loggedModal);
    
    const rect = event.currentTarget.getBoundingClientRect(); // Ottieni la posizione del bottone
    console.log(event.currentTarget.getBoundingClientRect()) 

    setLoggedModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right - (70),
    }); 
  };

 
  //   console.log(validateLoginForm(), loginErrors)
  //   e.preventDefault();
  //   if (validateLoginForm()) {
  //     loginUser();
  //   }
  // };
  
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
          <li> 
           {loggedUser.name}
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
                onClick={() => { 
                  setIsLoginOpen(false); 
                  setLoginErrors(false); 
                }}>
                x
              </button>
            </div>

            {/* Form per inserire i dati */}
            <form onSubmit={handleSubmit((data) => loginUser(data))}>

              <div className="mb-3">
                <label className="block text-sm font-medium">Email</label>
                <input
                  {...register ("loginEmail", {required:"Email is required",  
                    pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Insert valid email",
                  }, })} 
                  type="text"
                  className="mt-1 p-2 ps-8 w-full border rounded-md"  
                               
                />
                  {errors.loginEmail  && <p className="login-error">{errors.loginEmail.message}</p>}
              </div>

              <div >
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input {...register ("loginPassword", {required: "Password is required"})}
                  type="password"
                  className="mt-1 p-2 w-full border rounded-md"
                 
                />
               {errors.loginPassword && <p className="login-error">{errors.loginPassword.message}</p>}
              </div>

              {loginErrors && (
                <div className="login-error text-right mb-3">
                  <span>The credentials are incorrect</span>
                </div>
              )}
            
              <div>
                <p>
                  Not registered? <span className="click-here" onClick={() => {setIsRegistrationOpen(true); setIsLoginOpen(false);setLoginErrors()}}>
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
           <form onSubmit={handleSubmit((data) => registerUser(data))}>
           <div className="mb-3">
               <label className="block text-sm font-medium">Name</label>
               <input
               {...register ("registrationName", {required:"Name is required",  
                pattern: {
                  value: /^[A-Z][a-zA-Z]*$/,  
                  message: "Insert valid Name(only letters, start with uppercase)",
                }, })} 
                 type="text"
                 className="mt-1 p-2 ps-8 w-full border rounded-md"
               />
                {errors.registrationName && <p className="login-error">{errors.registrationName.message}</p>}
             </div>

             <div className="mb-3">
               <label className="block text-sm font-medium">Email</label>
               <input
                {...register ("registrationEmail", {required:"Email is required",  
                  pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Insert valid email",
                }, })} 
                 type="text"
                 className="mt-1 p-2 ps-8 w-full border rounded-md"   
               />
                {errors.registrationEmail && <p className="login-error">{errors.registrationEmail.message}</p>}

             </div>

             <div className="mb-3">
               <label className="block text-sm font-medium text-gray-700">
                 Password
               </label>
               <input
               {...register ("registrationPassword", {required: "Password is required",   pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|;:'",.<>/?]).{8,}$/,
                message: "Password must be at least 8 characters long, with a mix of uppercase, lowercase, digits, and special characters.",
              },})}
                 type="password"
                 className="mt-1 p-2 w-full border rounded-md"
               />
                {errors.registrationPassword && <p className="login-error">{errors.registrationPassword.message}</p>}
           
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register("registrationPasswordConfirmation", {
                    required: "Password confirmation is required",
                    validate: (value) => value === password || "Passwords must match", // Confronta con la password
                  })}
                  className="mt-1 p-2 w-full border rounded-md"
                />
                {errors.registrationPasswordConfirmation && <p className="login-error">{errors.registrationPasswordConfirmation.message}</p>}

              </div>
             <div>
               <p>
                 Already registered? <span className="click-here" onClick={() => {setIsRegistrationOpen(false); setIsLoginOpen(true)}}>
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
