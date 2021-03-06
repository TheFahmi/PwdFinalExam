import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Pagination from 'react-js-pagination';
import { CartAction, customerDiskon } from '../actions';

import { APIURL } from '../supports/APiUrl';
import Swal from 'sweetalert2'
import { CustomInput, Modal, ModalBody, ModalFooter, ModalHeader, Button, Table } from 'reactstrap';
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

const myCurrency = new Intl.NumberFormat('in-Rp', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
class Cart extends Component {

    state = {
        listCart: [],
        selectedIdEdit: 0,
        activePage: 1,
        itemPerPage: 3,
        Promo: [],
        kode: '',
        namapromo: '',
        totalpotongan: 0,
        alamatuser: '',
        isModalAlamatOpen: false,
        isModalAlamatEdit: false
    }

    handlePageChange(pageNumb) {
        console.log(`active page is ${pageNumb}`);
        this.setState({ activePage: pageNumb });
    }

    componentDidMount() {
        this.showCart();
        
        // this.CheckPromo();
        console.log(this.props.alamat)

        console.log(this.state.kode)
    }

    toogleadd = () => {
        this.setState({ isModalAlamatOpen: !this.state.isModalAlamatOpen })
    }

    toggleedit = () => {
        this.setState({ isModalAlamatEdit: !this.state.isModalAlamatEdit })
    }

    onBtnAddClick = () => {

        axios.put(`${APIURL}/cart/editalamat`,{
            id : this.props.userid,
            alamat : this.refs.addalamat.value,
            phone : this.refs.addphone.value
            
        }).then((res) => {
            this.showCart();
            this.renderAlamat()
            this.setState({ isModalAlamatOpen: false })
        }).catch((err) => {
            console.log(err);
        })

    //    window.location = '/cart'
    }

    onBtnEditClick = () => {

        axios.put(`${APIURL}/cart/editalamat`,{
            id : this.props.userid,
            alamat : this.refs.editalamat.value,
            phone : this.refs.editphone.value
            
        }).then((res) => {
            this.showCart();
            this.setState({ isModalAlamatOpen: false })
        }).catch((err) => {
            console.log(err);
        })

       window.location = '/cart'
    }

    onBtnCheckout = () => {
        // this.props.customerDiskon(this.state.totalpotongan)

        if(this.state.alamatuser === '0'){
            window.alert('alamat harus di isi!')
        }
        else{
            window.location = `/checkout?promo=${this.state.namapromo}`
        }

        
    }

    showCart = () => {
        axios.get(`${APIURL}/cart/cart?username=` + this.props.username)
            .then((res) => {
                console.log(res);
                var alamat = ''
                var phone = ''
                res.data.forEach(element => {
                    alamat = element.alamat
                    phone = element.phone
                })
                console.log(alamat)

                this.setState({
                    listCart: res.data,
                    selectedIdEdit: 0,
                    alamatuser: alamat,
                    phoneuser: phone
                });
                this.props.CartAction(this.state.listCart.length);
            }).catch((err) => {
                console.log(err);
            })
    }

    totalPrice = () => {
        var totalx = 0
        for (let i = 0; i < this.state.listCart.length; i++) {

            totalx += this.state.listCart[i].kuantiti * this.state.listCart[i].harga
        }
        return totalx;

    }

    totalPotong = () => {
        let totalpotongan = 0;
        let promo = this.state.totalpotongan
        console.log(promo)

        for (let i = 0; i < this.state.listCart.length; i++) {
            totalpotongan += this.state.listCart[i].kuantiti * this.state.listCart[i].harga * (promo / 100);


        }
        // console.log(this.props.customerDiskon(totalpotongan))
        // this.props.customerDiskon(totalpotongan)
        // console.log(this.props.TotalDiskon)
        console.log(totalpotongan)
        this.props.customerDiskon(totalpotongan)
        console.log(this.props.diskon)
        return totalpotongan

    }

    totalSubtotal = () => {
        var totalpotong = 0;
        var totaly = 0
        var promo = this.state.totalpotongan

        for (let i = 0; i < this.state.listCart.length; i++) {
            totalpotong = this.state.listCart[i].kuantiti * this.state.listCart[i].harga * (promo / 100);
            totaly += this.state.listCart[i].kuantiti * this.state.listCart[i].harga - totalpotong
        }
        return totaly;
    }

    onBtnSaveClick = (name) => {
        var kuantiti = parseInt(this.refs.quantity.value);
        var stok = this.state.listCart[0].stok
        if (kuantiti <= 0) {
            window.alert('Quantity harus di isi!')
        }
        else if
            (kuantiti > stok) {
            window.alert(`stock sisa ${stok}`)
        }

        else {
            axios.put(`${APIURL}/editcart/editcart/` + name.id, {
                name, kuantiti
            }).then((res) => {
                this.showCart();
            }).catch((err) => {
                console.log(err);
            })
        }
    }

    onBtnDeleteClick = (id) => {

        MySwal.fire({
            title: `Are you sure wanna delete?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                axios.delete(`${APIURL}/deletecart/deletecart/` + id)
                    .then((res) => {
                        MySwal.fire(
                            'Deleted!',
                            'Your file has been deleted.',
                            'success'
                        )
                        console.log(res);
                        this.showCart();
                    })

            }
        }).catch((err) => {
            console.log(err);
        })
    }

    // 


    CheckPromo = () => {

        axios.get(`${APIURL}/order/getpromo?namapromo=` + this.state.namapromo)
            .then((res) => {
                var potongan = 0
                res.data.forEach(element => {
                    potongan = element.jenis

                    MySwal.fire(
                        'Success!',
                        `You got discount ${potongan}% `,
                        'success'
                    )


                });
                this.setState({
                    Promo: res.data,
                    totalpotongan: potongan
                });

            }).catch((err) => {
                console.log(err);

            })

    }

    // onStockCheck = () => {
    //     var stock = this.state.listCart.stok
    //     console.log(stock)
    //     var isi = parseInt(this.refs.quantity.value)
    //     console.log(isi)

    //     // if (isi > stock){
    //     //     isi = stock
    //     // }
    // }

    onBtnCS = () => {
        return window.location = '/products';
    }

    btnCustom = () => {
        var btnCustom;
        if (!this.state.listCart.length) {
            btnCustom = <button className="btn btn-success" style={{ fontSize: "13px" }} onClick={() => this.onBtnCS()}>Shop Again?</button>
        } else {
            btnCustom =
                <div>
                    <button className="btn btn-info btn-lg btn-block" style={{ fontSize: "13px" }} onClick={() => this.onBtnCS()}>Buy other products?</button>
                    <br />
                    <input onChange={e => this.setState({ namapromo: e.target.value })} defaultValue={this.props.namapromo} onKeyUp={this.CheckPromo} type="text" className="form-control" style={{ fontSize: "15px" }}
                        placeholder="Kode Promo"
                        ref="kode" />
                    <br />

                    <button className="btn btn-success btn-lg btn-block" style={{ fontSize: "13px" }} onClick={() => this.onBtnCheckout()}>Pay</button>
                </div>
        }
        return btnCustom;
    }


    renderalamat = () => {



        var alamat = this.state.alamatuser
        var phone = this.state.phoneuser

        if (alamat) {
            return (
                <tr>
                    <Modal isOpen={this.state.isModalAlamatEdit} toggle={this.toogle}>
                        <ModalHeader toggle={this.toggleedit}>Edit data</ModalHeader>
                        <ModalBody>
                            <textarea className="form-control" type="text" ref='editalamat' defaultValue={alamat} placeholder='Masukkan Alamat' className='form-control mt-2 ' style={{ height: "200px" }} />
                            <input type="text" ref='editphone' defaultValue={phone} placeholder='No Telepon' className='form-control mt-2' />

                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.onBtnEditClick}>Save</Button>
                            <Button color="secondary" onClick={this.toggleedit}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <td className="text-center" style={{ fontSize: '14px', }}>{alamat}</td>
                    <td className="text-center" style={{ fontSize: '14px', }}>{phone}</td>
                    <td>
                        <button className='btn btn-primary' onClick={this.toggleedit}>Edit data</button>
                    </td>
                </tr>


            )
        }

    }
    renderListCart = () => {
        var lastIndex = this.state.activePage * this.state.itemPerPage;
        var firstIndex = lastIndex - this.state.itemPerPage;
        var renderedProjects = this.state.listCart.slice(firstIndex, lastIndex);
        var listJSXCart = renderedProjects.map((item) => {

            if (item.id === this.state.selectedIdEdit) {
                return (
                    <tr>
                        {/* <td className="text-center" style={{fontSize: '14px', }}>{item.id}</td> */}
                        <td className="text-center" style={{ fontSize: '14px', }}>{item.Nama_product}</td>
                        <td className="text-center" style={{ fontSize: '14px', }}>{myCurrency.format(item.harga)}</td>
                        <td><center><img src={`${APIURL}${item.image}`} height='10' width='10' /></center></td>
                        <td className="text-center" style={{ fontSize: '14px', }}><input type="number" defaultValue={item.kuantiti} size="4"
                            ref="quantity" className="form-control" /></td>
                        {/* onChange={this.onStockCheck()} */}
                        <td className="text-center" style={{ fontSize: '14px', }}>{myCurrency.format(item.harga * item.kuantiti)}</td>
                        <td>
                            <center>
                                <button className="btn btn-success" style={{ borderRadius: '30px', height: '30px', width: '30px' }}
                                    onClick={() => this.onBtnSaveClick(item)}>
                                    <i className="fa fa-save" style={{ fontSize: '14px' }}></i>
                                </button>
                            &nbsp;
                            <button className="btn btn-warning" style={{ borderRadius: '30px', height: '30px', width: '30px' }}
                                    onClick={() => this.setState({ selectedIdEdit: 0 })}>
                                    <i style={{ fontSize: '14px' }} className="fa fa-times"></i>
                                </button>
                            </center>
                        </td>
                    </tr>
                )
            }

            return (
                <tr>
                    {/* <td className="text-center" style={{fontSize: '14px', }}>{item.id}</td> */}
                    <td className="text-center" style={{ fontSize: '14px', }}>{item.Nama_product}</td>
                    <td className="text-center" style={{ fontSize: '14px', }}>{myCurrency.format(item.harga)}</td>

                    <td><center><img src={`${APIURL}${item.image}`} alt={item.image} style={{ width: '100px' }} /></center></td>
                    <td className="text-center" style={{ fontSize: '14px', }}>{item.kuantiti}</td>
                    <td className="text-center" style={{ fontSize: '14px', }}>{myCurrency.format(item.harga * item.kuantiti)}</td>
                    <td>
                        <center>
                            <button className="btn btn-info" style={{ borderRadius: '30px', height: '30px', width: '30px' }}
                                onClick={() => this.setState({ selectedIdEdit: item.id })}>
                                <i className="fa fa-edit" style={{ fontSize: '14px' }}></i>
                            </button>
                        &nbsp;
                        <button className="btn btn-danger" style={{ borderRadius: '30px', height: '30px', width: '30px' }}
                                onClick={() => this.onBtnDeleteClick(item.id, item.Nama_product)}>
                                <i className="fa fa-trash" style={{ fontSize: '14px', }}></i>
                            </button>
                        </center>
                    </td>
                </tr>
            )

        })

        return listJSXCart;
    }

    render() {


        var alamat = this.props.alamat
        console.log(this.props.alamat)
        if (this.props.username !== '') {
            if (this.props.status === 'Verified') {
                if (this.state.listCart.length > 0) {
                    return (


                        <div full-width-div table-responsive card shadow col-md-12 style={{ height: "700px", marginTop: "100px" }}>

                            <h2 className="section-heading text-center text-uppercase" style={{ marginTop: '150px' }}>Hello, {this.props.username}</h2>
                            <h3 className="section-subheading text-muted text-center pb-5">Happy Shopping</h3>
                            <div className="row ">
                                {/*  */}
                                <table className="col-md-7 table table-striped table-hover border shadow" style={{ marginLeft: "150px" }}>
                                    <thead className="thead-light">
                                        <tr>
                                            <th scope="col" className="font-weight-bold text-uppercase" style={{ fontSize: '16px', }}><center>Product</center></th>
                                            <th scope="col" className="font-weight-bold text-uppercase" style={{ fontSize: '16px', }}><center>Price</center></th>
                                            <th scope="col" className="font-weight-bold text-uppercase" style={{ fontSize: '16px', }}><center>Image</center></th>
                                            <th scope="col" className="font-weight-bold text-uppercase" style={{ fontSize: '16px', }}><center>Qty</center></th>
                                            <th scope="col" className="font-weight-bold text-uppercase" style={{ fontSize: '16px', }}><center>Total Price</center></th>
                                            <th scope="col" className="font-weight-bold text-uppercase" style={{ fontSize: '16px', }}><center>Options</center></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.renderListCart()}
                                    </tbody>
                                </table>
                                <div className="col-xs-3">
                                    <table className="table table-striped table-hover bordered shadow">
                                        <thead className="thead-light">
                                            <tr>
                                                <th scope="col" className="font-weight-bold text-uppercase" style={{ fontSize: '16px', }}><center>Detail Price</center></th>
                                            </tr>
                                        </thead>
                                        <tr>
                                            <td colSpan="8">
                                                <div className="text-center" style={{ fontSize: '14px', }}>Total Harga : {myCurrency.format(this.totalPrice())}</div>
                                            </td>

                                        </tr>
                                        <tr>
                                            <td colSpan="8">
                                                <div className="text-center" style={{ fontSize: '14px', }}>Total Potongan : {myCurrency.format(this.totalPotong())}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="8">
                                                <div className="text-center" style={{ fontSize: '14px', }}>Subtotal : {myCurrency.format(this.totalSubtotal())}</div>
                                            </td>
                                        </tr>

                                        {/* <tr>
                                            <td colSpan="8">
                                                <input type="text" className="form-control" style={{ fontSize: "12px" }}
                                                    placeholder="Input Kode Promo"
                                                    ref="searchbyname" onKeyUp={this.onBtnSearchClick} />
                                            </td>
                                        </tr> */}
                                        <tr>
                                            <td colSpan="8">
                                                <div align="center">{this.btnCustom()}</div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <table className="col-md-7 table table-striped table-hover border shadow" style={{ marginLeft: "150px" }} >
                                    <thead className="thead-light">
                                        <tr>
                                            <th scope="col" className="font-weight-bold text-uppercase" style={{ fontSize: '16px', }}><center>Alamat</center></th>
                                            <th scope="col" className="font-weight-bold text-uppercase col-xs-3" style={{ fontSize: '16px', }}><center>Phone</center></th>
                                            <th scope="col" className="font-weight-bold text-uppercase col-xs-1" style={{ fontSize: '16px', }}><center>Action</center></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            alamat === '0' ?
                                                <div>

                                                    <button className='btn btn-primary' onClick={this.toogleadd}>Add data</button>
                                                    <Modal isOpen={this.state.isModalAlamatOpen} toggle={this.toogleadd}>
                                                        <ModalHeader toggle={this.toogleadd}>Add data</ModalHeader>
                                                        <ModalBody>
                                                            <textarea className="form-control"type="text" ref='addalamat' placeholder='Masukkan Alamat' className='form-control mt-2 ' style={{height:"200px"}} />
                                                            <input type="text" ref='addphone' placeholder='No Telepon' className='form-control mt-2' />

                                                        </ModalBody>
                                                        <ModalFooter>
                                                            <Button color="primary" onClick={this.onBtnAddClick}>Save</Button>
                                                            <Button color="secondary" onClick={this.toogleadd}>Cancel</Button>
                                                        </ModalFooter>
                                                    </Modal>


                                                </div>



                                                :
                                                this.renderalamat()

                                            // <button className='btn btn-danger' onClick={() => this.onBtnDeleteClick}>2</button>

                                        }
                                    </tbody>
                                </table>

                            </div>
                            <div className="row justify-content-center">
                                <Pagination
                                    activePage={this.state.activePage}
                                    itemsCountPerPage={this.state.itemPerPage}
                                    totalItemsCount={this.state.listCart.length}
                                    pageRangeDisplayed={3}
                                    onChange={this.handlePageChange.bind(this)}
                                />
                            </div>

                        </div>
                    )
                } else {
                    return (
                        <div style={{ height: '600px' }}>
                            <div className="d-flex justify-content-center" style={{ marginTop: '130px' }}>
                                <div className="alert alert-warning col-md-4 mt-5 border shadow-lg" style={{ fontSize: "20px" }}>
                                    <center><b>Upps, Your shopping cart is empty!!!</b><br /></center>
                                </div>
                            </div>
                        </div>
                    )
                }
            } else {
                return (
                    <Redirect to="/waitingverification" />
                )
            }
        } else {
            return (
                <Redirect to="/login" />
            )
        }
    }

}

const mapStateToProps = (state) => {
    return {
        username: state.auth.username,
        userid: state.auth.id,
        phone: state.auth.phone,
        myRole: state.auth.role,
        status: state.auth.status,
        alamat: state.auth.alamat,
        Cart: state.Cart.cart,
        diskon: state.Cart.hasilDiskon
        // totalpotongan: state.Cart.totalpotongan
    }
}

export default connect(mapStateToProps, { CartAction, customerDiskon })(Cart);