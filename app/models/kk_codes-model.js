//Book
module.exports = (sequelize, Sequelize) => {
    const kk_codes = sequelize.define("kk_codes", {    
      code: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      msg: {
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
  
    return kk_codes;
  };