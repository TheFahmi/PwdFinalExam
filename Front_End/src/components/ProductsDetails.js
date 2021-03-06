import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { select_products } from '../actions';
import queryString from 'query-string';
import { Redirect } from 'react-router-dom';
import { Button, InputGroup, InputGroupAddon } from 'reactstrap';
import { toast } from 'react-toastify'
// import { Redirect } from 'react-router-dom';
import { APIURL } from '../supports/APiUrl';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)
const rupiah = new Intl.NumberFormat('in-Rp', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

class ProductsDetails extends Component {

    state = {
        totalQty: 0,
        category: '',
        location: [],
        allproducts: [],
        productdetail: []
    }

    componentDidMount() {
        var params = queryString.parse(this.props.location.search);
        var id = params.id;
        // console.log('Params id = ' + id)
        axios.get(`${APIURL}/productdetail/productdetail`, {
            params: {
                id
            }
        }).then((res) => {
            this.setState({ productdetail: res.data[0] })
            console.log(this.state.productdetail.stok)
        }).catch((err) => {
            console.log(err)
        })
    }

    // function untuk menambahkan produk ke cart, jika user memasukan product yang sma yang sudah ada dalam cart, maka otomatis barang tersebut akan ditimpa
    onBtnAddToCart = (harga, id) => {
        if (this.props.username === "") {
            MySwal.fire(
                'LOGIN FIRST!!',
                'You must login first!!',
                'danger'
              );
            window.location ="/login";
        } else {

            var kuantiti = this.refs.quantity.value;
            var total_harga = kuantiti * harga
            axios.get(`${APIURL}/cart/cartproduct`, {
                params: {
                    username: this.props.username,
                    product_id: id,
                }
            }).then((res) => {
                if (res.data.length > 0) {
                    axios.put(`${APIURL}/editcart/protectcart/` + res.data[0].id, {
                        user_id: this.props.id,
                        product_id: id,
                        kuantiti,
                        total_harga
                    }).then((res) => {
                        console.log(res.data)
                        console.log(this.state.listCart[0].stok)
                    }).catch((err) => {
                        console.log(err);
                    })
                    MySwal.fire(
                        'Success!',
                        'Your item has been moved to cart.',
                        'success',
                        3000
                        
                      )
                    window.location = "/cart";

                } else {
                    axios.post(`${APIURL}/cartplus/cartplus`, {
                        user_id: this.props.id,
                        product_id: id,
                        kuantiti,
                        total_harga
                    }).then((res) => {
                        console.log(res);
                        MySwal.fire(
                            'Success!',
                            'Your item has been moved to cart.',
                            'success',
                            3000
                            
                          )
                        window.location = "/cart";
                    }).catch((err) => {
                        console.log(err);
                        MySwal.fire(
                            'Failed!',
                            'Your item failed moved to cart',
                            'danger'
                          )
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
        }
    }
    
    CheckStock = () => {
        // var stok = this.state.productdetail.stok
        var arr = []

        for(let i = 1; i <= this.state.productdetail.stok; i++) {
            arr.push(<option>{i}</option>)
        }
        return arr
    }

    btnAddWishlist = (id) => {
        var currentdate = new Date();
        var date = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getDate();

        // + " " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
        if (this.props.username === "") {
            alert("Please Login First!");
            window.location ="/login";
        } else {
            axios.get(`${APIURL}/wishlist/getprotectwishlist`, {
                params: {
                    username: this.props.username,
                    product_id: id,
                }
            }).then((res) => {
                if (res.data.length > 0) {
                    axios.put(`${APIURL}/editcart/protectwishlist/` + res.data[0].id, {
                        user_id: this.props.id,
                        product_id: id,
                        date
                    }).then((res) => {
                        console.log(res.data)
                    }).catch((err) => {
                        console.log(err);
                    })
                    alert('Succes add to wishlist!')
                    window.location = "/wishlist";
                } else {
                    axios.post(`${APIURL}/wishlist/addwishlist`, {
                        user_id: this.props.id,
                        product_id: id,
                        date
                    }).then((res) => {
                        console.log(res);
                        alert(`Success add to wishlist!`);
                        window.location = "/wishlist";
                    }).catch((err) => {
                        console.log(err);
                        alert(`Failed add to wishlist`);
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
        }
    }


    // render tampilkan produk details
    render() {
        var { id, nama, harga, image, deskripsi, stok } = this.state.productdetail;
        const enabled = stok > 0


        return (
            // <div className="row justify-content-center bg-light border shadow-lg" style={{marginLeft: '100px', marginRight: '100px', marginTop: '150px'}}>
            // <div className="col-sm-10 bg" style={{ height: '500px', paddingTop: '30px', paddingBottom: '30px' }}>
            // <h1 className="section-subheading text-center font-weight-bold" style={{ color: "black" }}>{nama}</h1>
            // <div className="row" style={{paddingTop: '30px'}}>
            //     <div className="col-8 col-sm-6 bg-" style={{height: '300px'}}>
            //         <img src={`${APIURL}${image}`} alt={image} height="250px" className="float-right"/>
            //     </div>
            //     <div className="col-4 col-sm-6" style={{height: 'auto'}}>
            //     <div style={{width: "380px"}}>
            //         <h3 className="font-weight-normal">{deskripsi}</h3>
            //         <br></br>
            //         <InputGroup size="lg">
            //             <InputGroupAddon addonType="prepend">Quantity</InputGroupAddon>
            //                 <select defaultValue="1" ref="quantity" innerRef="addquantity" type="number">
            //                     <option>1</option>
            //                     <option>2</option>
            //                     <option>3</option>
            //                     <option>4</option>
            //                     <option>5</option>
            //                 </select>
            //         </InputGroup>
            //         <br/>
            //         <Button style={{ fontSize: '15px' }} color="primary" size="lg" block onClick={() => this.onBtnAddToCart(harga, id)}>Add To Cart</Button>
            //         <br />
            //         <Button style={{fontSize: '15px'}} color="success" size="lg" block onClick={() => this.btnAddWishlist(id)}>Wishlist</Button>
            //     </div>
            //     </div>
            // </div>
            // </div>
            // </div>
            

            <div className="container" style={{paddingTop: '100px'}}>
                <div className="col-sm-10 bg" style={{ height: '750px', paddingTop: '30px', paddingBottom: '30px' }}>
                    <div className="row row-top row-bottom" >
                        <div className="card col-5 mx-auto" style={{height: '350px'}}>
                            <div className="row" >
                                <img src={`${APIURL}${image}`} alt={image}style={{height: '300px', width: '300px'}}className="col-12" />
                            </div>
                        </div>
                        <div className="col-7 product-data">
                            <h2>{nama}</h2>
                            <h4>Stock : {stok}</h4>
                            <h3 className="text-orange">
                            <div className="price-container">
                                <span className="price price-new">{rupiah.format(harga)}</span>
                            </div>
                            </h3>
                            <hr style={{width:'auto'}}></hr>
                            <h3 className="mt-5 mb-2">Deskripsi</h3>
                            <p className="mt-1 mb-4 p_warp" id="arsh" style={{height: '400px', fontSize:"13px"}}>{deskripsi}</p>
                            <div className="row" style={{marginTop:"150px"}}>
                                <div className="col-3">
                                    
                                    <InputGroup size="lg">
                                        <InputGroupAddon addonType="prepend">Quantity</InputGroupAddon>
                                        <select defaultValue="1" ref="quantity" innerRef="addqty" type="number">
                                        
                                       {this.CheckStock()}
                                        
                                        </select>
                                    </InputGroup>
                                </div>
                                
                                <div className="col-3">
                                    
                                    <Button className="btn btn-orange" disabled={!enabled} block onClick={() => this.onBtnAddToCart(harga, id)}>Add To Cart</Button>
                                </div>
                                <div className="col-3">
                                    <Button className="btn btn-red" block onClick={() => this.btnAddWishlist(id)}>Wishlist</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        username: state.auth.username,
        products: state.selectedProducts,
        id: state.auth.id,
        status: state.auth.status
    }
}

export default connect(mapStateToProps, { select_products })(ProductsDetails);