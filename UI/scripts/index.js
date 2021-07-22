/*Slide Show
var slideIndex = 0;
showSlides();

function showSlides() {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}
  slides[slideIndex-1].style.display = "block";
  setTimeout(showSlides, 2000); // Change image every 2 seconds
} */

//Products & Shopping Cart
// variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//Cart Items
let cart = [];
let buttonsDOM = [];

//Getting the products
class Products{
async getProducts(){
        try{
          let result = await fetch("./UI/scripts/products.json");
          let data = await result.json();
          let products = data.items;
          products = products.map(item =>{
            const {title,price} = item.fields;
            const id = item.sys.id;
            const image = item.fields.image.fields.file.url;
            return {title, price, id, image}
          })
          return products;
        }catch(error){
            console.log('Couldn\'t Fetch Data: '+error);
        }
    }
}

// UI based stuff
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product=>{
            result += `
            <article class="product">
                <div class="img-container">
                  <img src=${product.image} alt="product-1" class="product-img">  
                  <button class="bag-btn" data-id=${product.id}><i class="fas fa-shopping-cart"></i>Add to Cart</button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            ` ;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        console.log('Button List',buttons)
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            console.log("INCART", inCart);
            if(inCart){
            button.innerText = 'IN CART';
            button.disabled = true; 
            }else{
                button.addEventListener('click',(event)=>{
                    event.target.innerText = 'IN CART';
                    event.target.disabled = true;
                    
                    //get product for products
                    let cartItem = {...Storage.getProducts(id),amount:1};
                    console.log('Clicked item',cartItem);
                    //add product to the cart 
                    cart = [...cart, cartItem];
                    console.log('Cart Array', cart);
                    //save the cart in local storage
                    Storage.saveCartArrayToLocalStorage(cart);
                    //set cart values
                    this.setCartValues(cart);
                    //display cart items
                    this.addCartItemToDOM(cartItem);
                    //show the cart
                    this.showCart();
                })
            }
        })        
    }
    setCartValues(cart){
        let tempTotal = 0, itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        //cartContent.innerText = itemsTotal;
    }
    addCartItemToDOM(item){
        const divElement = document.createElement('div');
        divElement.classList.add('cart-item');
        divElement.innerHTML = `
            <img src=${item.image} alt="">
            <div>
                <h4>$${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>   
        `;
        cartContent.appendChild(divElement);
        console.log('NEW CHILD',cartContent);
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
        // cartOverlay.addEventListener('click',()=>{
        //     cartOverlay.classList.remove('transparentBcg');
        //     cartDOM.classList.remove('showCart');
        // })
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    setupApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart);
    }
    populateCart(cart){
        cart.forEach(item =>{
         this.addCartItemToDOM(item)   
        })
    }
    
    clearCart(){
        let cartItems = cart.map(item => item.id);
        // cartContent.innerHTML = '';
        // cartTotal.innerText = ''; 
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        } 
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCartArrayToLocalStorage(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class='fas fa-shopping-cart'></i>Add to Cart`;
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id == id);
    }
    cartLogic(){
        
        clearCartBtn.addEventListener('click',()=>{
            alert("Thank you. Your order is being processed. Proceed To Payment & Checkout.");
            window.location = "products.html";
        }); 
        cartContent.addEventListener('click',event =>{
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
        })
    }

}

//Local Storage
class Storage{
    static saveProducts(products){ //saving products to local storage
        localStorage.setItem('products',JSON.stringify(products));
    }
    static getProducts(id){// getting the products back from local storage
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id == id)
    }
    static saveCartArrayToLocalStorage(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [] ;
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    const ui = new UI();
    const products = new Products();
    // setup application
    ui.setupApp();
    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products);

    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
});




