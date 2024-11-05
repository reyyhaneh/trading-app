import React, {useState, useEffect} from 'react'
import tradeService from '../services/TradeService'
import axios from 'axios';
import '../App.css'

const TradeForm = () => {

    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [btcPrice, setBtcPrice] = useState('');


    useEffect(() => {
        const fetchBtcPrice = async () => {
          try {
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
              params: {
                ids: 'bitcoin',
                vs_currencies: 'usd'
              }
            });
            setBtcPrice(response.data.bitcoin.usd); 
          } catch (error) {
            console.error('Error fetching BTC price:', error);
          }
        };
    
        fetchBtcPrice();
      }, []); 
    

    async function buy (formData) {
        const price = formData.get("price");
        const amount = formData.get("amount")


        const trade = `{
        "stockSymbol" : "BTC",
        "amount" : "${amount}",
        "price" : "${price}"
        }`;
        


        try {
            // Logic for validating if the user can afford to buy or not.
            await tradeService.buyStock(trade)
            alert('Trade executed successfully');
        } catch (error){
            console.error('Trade failed', error);
        }

    }

    async function sell (formData) {
        const price = formData.get("price");
        const amount = formData.get("amount")

        let trade = `{
        "stockSymbol" : "BTC",
        "amount" : "${amount}",
        "price" : "${price}"
        }`;

        try {
            // Logic for validating if the user can afford to buy or not.
            await tradeService.sellStock(trade)
            alert('Trade executed successfully');
        } catch (error){
            console.error('Trade failed', error);
        }

    }
    const handleAmountChange = (e) => {
        const newAmount = e.target.value;
        setAmount(newAmount);
        if (btcPrice) {
          const newPrice = (newAmount * btcPrice).toFixed(2); // Keep it to 2 decimal places
          setPrice(newPrice);
        }

    }
    const handlePriceChange = (e) => {
        const newPrice = e.target.value;
        setPrice(newPrice);
        if(btcPrice) {
            const newAmount = (newPrice/btcPrice).toFixed(6);
            setAmount(newAmount);
        }
    }

    return (
        <div className="trade-form-wrapper">
            <form className="trade-form" >
                <div className="form-group row">
                    <label htmlFor="price">Price: </label>
                    <div className="col-sm-10">
                        <input
                         type="number" className="form-control" id="price" min="0.01" step="0.01"
                         name="price" value={price} onChange={handlePriceChange}
                         />
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="amount">Amount: </label>
                    <div className="col-sm-10">
                        <input type="number" className="form-control" id="amount"
                        name="amount" value={amount} onChange={handleAmountChange} />
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-sm-10">
                        <button className="btn btn-success m-1" formAction={buy}>Buy</button>
                        <button className="btn btn-danger m-1" formAction={sell}>Sell</button>

                    </div>

                </div>
            </form>
        </div>
    )
};

export default TradeForm;