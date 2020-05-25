//Book
module.exports = (sequelize, Sequelize) => {
    const Vggallery = sequelize.define("vggallery", {    
      category: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      main: {
        type: Sequelize.STRING(255),
        allowNull: true
      },             
      page: {
        type: Sequelize.STRING(255),
        allowNull: true
      },        
      image: {
        type: Sequelize.STRING(255),
        allowNull: true       
      },  
      title: {
        type: Sequelize.TEXT,
        allowNull: true
      },     
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      }, 
      origin: {
        type: Sequelize.STRING(255),
        allowNull: true
      },  
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },             
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
        allowNull: false 
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true 
      }
    });
  
    return Vggallery;
  };