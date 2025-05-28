window.addEventListener("DOMContentLoaded", function () {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // canvas settings
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;

  class Particle {
    constructor(effect) {
      this.effect = effect;
      this.x = Math.floor(Math.random() * this.effect.width);
      this.y = Math.floor(Math.random() * this.effect.height);
      this.speedX;
      this.speedY;
      this.speedModifier = Math.floor(Math.random() * 5 + 1);
      this.history = [{ x: this.x, y: this.y }]; //массив history инициализируется с начальным положением частицы ({x: this.x, y: this.y}). Это означает, что в самом начале след будет содержать только одну точку — начальную позицию частицы.
      this.maxLength = Math.floor(Math.random() * 200 + 10);
      this.angle = 0;
      this.timer = this.maxLength * 2;

      this.colors = ['#2496a3', '#49c8d6', '#6cdeeb', '#a2f3fc'];
      
      this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    draw(context) {
     
      context.beginPath();
      context.moveTo(this.history[0].x, this.history[0].y); //сначала рисуется текущая позиция частицы в виде квадрата (10x10 пикселей).
      for (let i = 0; i < this.history.length; i++) {
        context.lineTo(this.history[i].x, this.history[i].y); // начинается отрисовка линии, которая проходит через все точки, сохранённые в массиве history. Это создаёт эффект следа, который показывает путь, пройденный частицей.
      }
      context.strokeStyle = this.color;
      context.stroke();
    }
    update() {
      this.timer--;
      if (this.timer >= 1) {
         let x = Math.floor(this.x / this.effect.cellSize);
         let y = Math.floor(this.y / this.effect.cellSize);
         let index = y * this.effect.cols + x;
         this.angle = this.effect.flowField[index];

         this.speedX = Math.cos(this.angle);
         this.speedY = Math.sin(this.angle);
         this.x += this.speedX * this.speedModifier;
         this.y += this.speedY * this.speedModifier;
         
         this.history.push({ x: this.x, y: this.y }); // обновление положения частицы, координаты x и y частицы изменяются на величины speedX и speedY, соответственно. После этого новое положение частицы добавляется в массив history.
         if (this.history.length > this.maxLength) {
           this.history.shift();
         }
         
      }else if (this.history.length > 1){
         this.history.shift();
      }else{
         this.reset();
      }

    }
    reset(){
      this.x = Math.floor(Math.random() * this.effect.width);
      this.y = Math.floor(Math.random() * this.effect.height);
      this.history = [{ x: this.x, y: this.y }]; 
      // this.angle = 0;
      this.timer = this.maxLength * 2;
    }
  }
  class Effect {
    constructor(canvas) {

      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.particles = [];
      this.numberOfParticles = 1300;
      this.cellSize = 20;// can be changed for create new pattern
      this.rows;
      this.cols;
      this.flowField = [];
      this.curve = 5;// can be changed for create new pattern
      this.zoom = 0.08;// can be changed for create new pattern
      this.debug = false;
      this.init();
      window.addEventListener('keydown', e => {
         if(e.key === 'd') this.debug = !this.debug;
      });
      window.addEventListener('resize', e => {
         this.resize(e.target.innerWidth, e.target.innerHeight);
        
      });
    }
    init() {
       // create flow field
      this.rows = Math.floor(this.height / this.cellSize);
      this.cols = Math.floor(this.width / this.cellSize);
      this.flowField = [];
      for (let y = 0; y < this.rows; y++) {
         for (let x = 0; x < this.cols; x++) {
            let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
            // let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) + this.curve;
            this.flowField.push(angle);
         }     
      }
       // create prticles
       this.particles = [];
      for (let i = 0; i < this.numberOfParticles; i++) {
        this.particles.push(new Particle(this));
      }
    }
    drawGrid(context){
      context.save();
      context.strokeStyle = 'red';
      for (let c = 0; c < this.cols; c++) {
         context.beginPath();
         context.moveTo(this.cellSize * c, 0);
         context.lineTo(this.cellSize * c, this.height);
         context.stroke();
      }
      for (let r = 0; r < this.rows; r++) {
         context.beginPath();
         context.moveTo(0, this.cellSize * r );
         context.lineTo(this.width, this.cellSize * r);
         context.stroke();
      }
      context.restore();
    }
    resize(width, height){
      this.canvas.width = width;
      this.canvas.height = height;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.init();
    }
    render(context) {
      if(this.debug) this.drawGrid(context);
      this.particles.forEach((particle) => {
        particle.draw(context);
        particle.update();
      });
    }
  }
  const effect = new Effect(canvas);
  console.log(effect);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.render(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
