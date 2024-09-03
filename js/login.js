
createlogin();


function createlogin() {
     const logincont = document.createElement("form")
     logincont.id = "loginForm"

     const input = document.createElement('input');
     input.type = 'text';
     input.id = 'identifier';
     input.name = 'identifier'
     input.required = true

     // Création d'un élément <label>
     const label = document.createElement('label');
     label.htmlFor = 'identifier'; // Liaison avec l'élément <input>
     label.textContent = 'Username or Email: '; // Texte du label

     const inputpass = document.createElement('input');
     inputpass.type = 'password';
     inputpass.id = 'password';
     inputpass.name = 'password'
     inputpass.required = true

     const pass = document.createElement('label');
     pass.htmlFor = 'identifier'; // Liaison avec l'élément <input>
     pass.textContent = 'Password: '; // Texte du label
     // Ajout des éléments au DOM

     const submitbutton = document.createElement('button')
     submitbutton.type = 'submit'
     submitbutton.innerText = 'Login'

     logincont.appendChild(label);
     logincont.appendChild(input);
     logincont.appendChild(pass);
     logincont.appendChild(inputpass);
     logincont.appendChild(submitbutton);

     document.body.appendChild(logincont);

     document.getElementById('loginForm').addEventListener('submit', async function (event) {
          event.preventDefault();
          const identifier = document.getElementById('identifier').value;
          const password = document.getElementById('password').value;
          const infos = btoa(`${identifier}:${password}`);

          try {
               const response = await fetch('https://zone01normandie.org/api/auth/signin', {
                    method: 'POST',
                    headers: {
                         'Authorization': `Basic ${infos}`,
                         'Content-Type': 'application/json',
                    },
               });

               if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('jwt', data.token);
                    drawdata(data)
               } else {
                    alert("Wrong Password or Email.");
               }
          } catch (error) {

               alert("Wrong Password or Email.");
          }
     });
}

function drawdata(data) {
     document.body.innerHTML = ""

     const query = {
          query: `{
               user {
                    id
                    lastName
                    firstName
                    auditRatio
                    totalUp
                    totalDown
               }
               transaction {
                    amount
                    type
               }     
          }`
     }

     const query2 = {
          query: `{
               user {
                    xps {
                         amount
                    }
               }
          }`
     }

     const query3 = {
          query: `{
               user {
                    transactions(order_by: {createdAt: asc}){
                         type
                         amount
                    }
               }
          }`
     }

     fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${data}`
          },
          body: JSON.stringify(query)
     })
          .then(response => response.json())
          .then(data => {

               const user = data.data.user[0];
               const alltransaction = data.data.transaction
               var allskills = []
               for (let i = 0; i < alltransaction.length; i++) {
                    if (alltransaction[i].type.includes("skill_")) {
                         allskills.push(alltransaction[i])
                    }
               }

               let tabEach = [[]]

               allskills.forEach(element => {
                    let found = false; // Indicateur pour savoir si on a trouvé un tableau avec le même type

                    // Vérifier chaque sous-tableau de tabEach
                    tabEach.forEach(skill => {
                         // Si le type du premier élément du sous-tableau correspond au type de l'élément courant
                         if (tabEach[0].length === 0) {
                              tabEach[0].push(element)
                              found = true
                         } else if (skill[0].type === element.type) {
                              skill.push(element); // Ajouter l'élément à ce sous-tableau
                              found = true; // Indiquer qu'on a trouvé le tableau correspondant
                              return; // Sortir de la boucle pour cet élément
                         }
                    });

                    // Si aucun tableau avec le même type n'a été trouvé
                    if (!found) {
                         let newTab = []; // Créer un nouveau tableau
                         newTab.push(element); // Ajouter l'élément à ce nouveau tableau
                         tabEach.push(newTab); // Ajouter ce nouveau tableau à tabEach   
                    }
               });

               let tabMax = []
               for (let i = 0; i < tabEach.length; i++) {
                    let max = getMaxValue(tabEach[i])
                    tabMax.push(max)
               }
               const ratio = (Math.round(user.auditRatio * 10) / 10)
               console.log(tabMax, user.totalUp, user.totalDown)
               const userInfo = document.getElementById('userInfo') || document.createElement('div');
               userInfo.id = 'userInfo';
               userInfo.innerHTML = `
               <p>User ID: ${user.id}</p>
               <p>Last Name: ${user.lastName}</p>
               <p>First Name: ${user.firstName}</p>
               <p>Audit Ratio: ${ratio}</p>
          `;

               document.body.appendChild(userInfo);

               const audit = document.createElement("div");
               audit.id = "ratio";

               const title = document.createElement("div")
               title.id = "auditratio"
               title.innerText = "Audit Ratio :"
               audit.appendChild(title);

               const maxWidth = 300; // Largeur maximale des barres
               const scaleFactor = maxWidth / Math.max(user.totalUp, user.totalDown); // Normalisation
               const upscale = user.totalUp * 10e-7
               const downscale = user.totalDown * 10e-7
               // Fonction pour créer le SVG et les barres horizontales
               // Créer l'élément SVG
               const svgNS = "http://www.w3.org/2000/svg";
               const svg = document.createElementNS(svgNS, "svg");
               svg.setAttribute("width", "470");
               svg.setAttribute("height", "120");

               // Créer la première barre horizontale pour totalUp
               const rectUp = document.createElementNS(svgNS, "rect");
               rectUp.setAttribute("x", "50");
               rectUp.setAttribute("y", "20");
               rectUp.setAttribute("width", user.totalUp * scaleFactor);  // Largeur selon la valeur de totalUp
               rectUp.setAttribute("height", "30");
               rectUp.setAttribute("fill", "blue");
               rectUp.setAttribute("rx", "10");
               rectUp.setAttribute("ry", "10");
               svg.appendChild(rectUp);

               // rectDownLabel pour la première barre
               const textUp = document.createElementNS(svgNS, "text");
               textUp.setAttribute("x", user.totalUp * scaleFactor + 55); // Position après la barre
               textUp.setAttribute("y", "40");
               textUp.setAttribute("font-family", "Arial");
               textUp.setAttribute("font-size", "12");
               textUp.setAttribute("fill", "white");
               textUp.textContent = `Done, ${upscale.toFixed(2)} Mb`;
               svg.appendChild(textUp);

               // Créer la deuxième barre horizontale pour totalDown
               const rectDown = document.createElementNS(svgNS, "rect");
               rectDown.setAttribute("x", "50");
               rectDown.setAttribute("y", "70");
               rectDown.setAttribute("width", user.totalDown * scaleFactor);  // Largeur selon la valeur de totalDown
               rectDown.setAttribute("height", "30");
               rectDown.setAttribute("fill", "red");
               rectDown.setAttribute("rx", "10");
               rectDown.setAttribute("ry", "10");
               svg.appendChild(rectDown);

               // Label pour la deuxième barre
               const textDown = document.createElementNS(svgNS, "text");
               textDown.setAttribute("x", user.totalDown * scaleFactor + 55); // Position après la barre
               textDown.setAttribute("y", "90");
               textDown.setAttribute("font-family", "Arial");
               textDown.setAttribute("font-size", "12");
               textDown.setAttribute("fill", "white");
               textDown.textContent = `Received, ${downscale.toFixed(2)} Mb`;
               svg.appendChild(textDown);

               // Ajouter le SVG à la page
               audit.append(svg);
               document.body.appendChild(audit)

               const ringsContainer = document.createElement('div');
               ringsContainer.id = 'ringsContainer';

               tabMax.forEach(element => {
                    const svgRing = createCircularRingSVG(element.amount, element.type);
                    const div = document.createElement('div');
                    div.innerHTML = svgRing;
                    ringsContainer.appendChild(div);
               });

               document.body.appendChild(ringsContainer);
               const delog = document.createElement("button")
               delog.id = "delog"
               document.body.appendChild(delog)
               document.getElementById("delog").addEventListener("click", function (event) {
                    logout()
               })

          })
          .catch(error => {
               console.error('Error fetching user data:', error);
          });
}


function logout() {
     document.body.innerHTML = ""
     localStorage.removeItem('jwt');
     createlogin();
}

function getMaxValue(arr) {
     // Utiliser reduce pour trouver l'objet avec la valeur 'amount' maximale
     return arr.reduce((max, obj) => {
          return obj.amount > max.amount ? obj : max;
     });
}


function createCircularRingSVG(percentage, type, radius = 95, strokeWidth = 10,) {
     // Limite le pourcentage entre 0 et 100
     percentage = Math.min(100, Math.max(0, percentage));

     // Dimensions du cercle
     const diameter = radius * 2;
     const circumference = 2 * Math.PI * (radius - strokeWidth / 2);

     // Calcul de l'offset pour représenter le pourcentage
     const offset = circumference - (percentage / 100) * circumference;

     // Création du SVG avec les éléments cercle
     const svg = `
         <svg width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}">
             <!-- Cercle de fond -->
             <circle
                 cx="${radius}" cy="${radius}" r="${radius - strokeWidth / 2}"
                 fill="none"
                 stroke="#e6e6e6"
                 stroke-width="${strokeWidth}"
             />
             <!-- Cercle de progression -->
             <circle
                 cx="${radius}" cy="${radius}" r="${radius - strokeWidth / 2}"
                 fill="none"
                 stroke="#EE82EE"
                 stroke-width="${strokeWidth}"
                 stroke-dasharray="${circumference}"
                 stroke-dashoffset="${offset}"
                 stroke-linecap="round"
                 transform="rotate(-90 ${radius} ${radius})"
             />
             <!-- Texte au centre -->
             <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20px" fill="white">${type} ${percentage}%</text>
         </svg>
     `;

     return svg;
}
