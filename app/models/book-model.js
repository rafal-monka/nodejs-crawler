//Book
module.exports = (sequelize, Sequelize) => {
    const Books = sequelize.define("book", {    
      lang: {
        type: Sequelize.STRING(10),
        allowNull: true       
      },  
      p_id: {
        type: Sequelize.INTEGER(10),
        allowNull: true       
      },  
      category: {
        type: Sequelize.INTEGER(10),
        allowNull: true
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: true
      },     
      author: {
        type: Sequelize.TEXT,
        allowNull: true
      }, 
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      }, 
      param: {
        type: Sequelize.TEXT,
        allowNull: true
      }, 	  
      term: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.STRING,
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
  
    return Books;
  };