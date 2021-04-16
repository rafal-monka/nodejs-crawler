//AOL
module.exports = (sequelize, Sequelize) => {
    const AOL = sequelize.define("AOL", {    
      tfi: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },             
      name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },     
      ir: {
        type: Sequelize.INTEGER(10),
        allowNull: true
      }, 
      stdv: {
        type: Sequelize.INTEGER(10),
        allowNull: true
      },
      sharpe: {
        type: Sequelize.INTEGER(10),
        allowNull: true
      }, 
      info: {
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
  
    return AOL;
  };