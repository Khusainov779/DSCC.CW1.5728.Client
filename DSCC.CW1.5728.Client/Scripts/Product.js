class Product extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      payload: null,
      id: 0,
      categoryId: 0,
      brand: "",
      model: "",
      price: 0,
      description: "",
      isOpen: false,
      isOpenCreate: false,
      singleData: null,
      index: 1,
      currentPage: 1,
      categoriesPerPage: 10,
      categories: null,
      address: "https://localhost:44300"
    };
  }

  componentDidMount() {
    fetch(`${this.state.address}/api/Category/`)
      .then(response => response.json())
      .then(json => {
        this.setState({
          categories: json
        });
      });
    this.refreshList();
  }

  componentDidUpdate() {
    this.refreshList();
  }

  refreshList() {
    fetch(`${this.state.address}/api/Product/`)
      .then(response => response.json())
      .then(json => {
        this.setState({
          payload: json,
          loading: false
        });
      });
  }

  deleteProduct(prodid) {
    if (window.confirm("Are you sure?")) {
      fetch(`${this.state.address}/api/Product/` + prodid, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });
    }
  }

  editModal = (item, index) => {
    this.setState({
      singleData: item,
      isOpen: true,
      index: index
    });
  };

  closeModalHandler = () => {
    this.setState({
      isOpen: false
    });
  };
  closeModalHandlerCreate = () => {
    this.setState({
      isOpenCreate: false
    });
  };
  openModalHandlerCreate = () => {
    this.setState({
      isOpenCreate: true
    });
  };

  paginate = pageNumber => this.setState({ currentPage: pageNumber });

  render() {
    if (this.state.loading) return <div>Loading</div>;

    let indexOfLastPost = this.state.currentPage * this.state.categoriesPerPage;
    let infexOfFirstPost = indexOfLastPost - this.state.categoriesPerPage;
    let currentPosts = this.state.payload.slice(
      infexOfFirstPost,
      indexOfLastPost
    );
    let categories = this.state.categories;

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Price</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts &&
              currentPosts.map((item, index) => (
                <tr style={{ margin: 5, fontFamily: "Arial" }} key={item.id}>
                  <td>
                    {" "}
                    {categories &&
                      categories.find(o => o.id == item.categoryId).name}{" "}
                  </td>
                  <td> {item.brand} </td>
                  <td> {item.model} </td>
                  <td> {item.price} </td>
                  <td> {item.description} </td>
                  <td>
                    {" "}
                    <button
                      className="btn btn-default"
                      onClick={() => this.editModal(item, index)}
                      style={{ marginRight: 10 }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => this.deleteProduct(item.id)}
                    >
                      Delete
                    </button>{" "}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {this.state.isOpen ? (
          <Modal
            index={this.state.index}
            handleSetPayload={payload => this.handleSetPayload(payload)}
            payload={this.state.payload}
            data={this.state.singleData}
            show={this.state.isOpen}
            close={this.closeModalHandler}
          />
        ) : null}
        {this.state.isOpenCreate ? (
          <CreateModal
            refreshMe={() => this.refreshList()}
            handleSetPayload={payload => this.handleSetPayload(payload)}
            payload={this.state.payload}
            show={this.state.isOpenCreate}
            close={this.closeModalHandlerCreate}
          />
        ) : null}

        <Pagination
          categoriesPerPage={this.state.categoriesPerPage}
          totalPosts={this.state.payload.length}
          paginate={this.paginate}
        />
        <button
          className="open-modal-btn"
          onClick={this.openModalHandlerCreate}
        >
          Create Product
        </button>
      </div>
    );
  }
}

class Pagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const pageNumbers = [];
    for (
      let i = 1;
      i <= Math.ceil(this.props.totalPosts / this.props.categoriesPerPage);
      i++
    ) {
      pageNumbers.push(i);
    }
    return (
      <nav>
        <ul className="pagination">
          {pageNumbers.map(number => (
            <li key={number} className="page-item">
              <a
                onClick={() => this.props.paginate(number)}
                className="page-link"
              >
                {number}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}

//EDIT PRODUCT
class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.data.id,
      categoryId: this.props.data.categoryId,
      brand: this.props.data.brand,
      model: this.props.data.model,
      price: this.props.data.price,
      description: this.props.data.description,
      index: this.props.index,
      address: "https://localhost:44300"
    };
  }

  handleSubmit = () => {
    const data = JSON.stringify({
      Id: this.state.id,
      CategoryId: parseInt(this.state.categoryId, 10),
      Brand: this.state.brand,
      Model: this.state.model,
      Price: parseInt(this.state.price, 10),
      Description: this.state.description
    });
    fetch(`${this.state.address}/api/Product/` + this.state.id, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "PUT",
      body: data
    })
      .then(response => response)
      .then(res => {
        if (res.status == 200) {
          //the default status of editing the info from table
          let afterEdit = this.props.payload;
          afterEdit[this.state.index].categoryId = this.state.categoryId;
          afterEdit[this.state.index].brand = this.state.brand;
          afterEdit[this.state.index].model = this.state.model;
          afterEdit[this.state.index].price = this.state.price;
          afterEdit[this.state.index].description = this.state.description;
          this.props.handleSetPayload([...afterEdit]);
          this.props.close();
        }
      })
      .catch(err => {});
    this.props.close();
  };

  handleChange = event => {
    //or model
    this.setState({ [event.target.name]: event.target.value });
  };
  render() {
    return (
      <div
        id="myModal"
        style={{ display: this.props.show ? "block" : "none" }}
        className="modal"
      >
        <div className="modal-content">
          <div className="modal-header">
            <span className="close" onClick={this.props.close}>
              &times;
            </span>
            <h2>Edit the product {this.state.brand} </h2>
          </div>
          <div className="modal-body">
            <h5> Product Brand</h5>
            <input
              name="brand"
              type="text"
              onChange={this.handleChange}
              value={this.state.brand}
            />
            <h5> Model</h5>
            <input
              name="model"
              type="text"
              onChange={this.handleChange}
              value={this.state.model}
            />
            <h5> Price</h5>
            <input
              type="number"
              name="price"
              onChange={this.handleChange}
              value={this.state.price}
            />
            <h5> Description</h5>
            <input
              name="description"
              type="text"
              onChange={this.handleChange}
              value={this.state.description}
            />
          </div>
          <div className="modal-footer">
            <button onClick={this.props.close}>Cancel</button>
            <button onClick={() => this.handleSubmit(this.state.id)}>
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }
}

//ADD NEW PRODUCT TO THE LIST
class CreateModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      categoryId: 0,
      brand: "",
      model: "",
      price: 0,
      description: "",
      categories: null,
      address: "https://localhost:44300"
    };
  }

  handleSubmit = () => {
    const data = JSON.stringify({
      CategoryId: parseInt(this.state.categoryId, 10),
      Brand: this.state.brand,
      Model: this.state.model,
      Price: parseInt(this.state.price, 10),
      Description: this.state.description
    });

    fetch(`${this.state.address}/api/Product/`, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: data
    })
      .then(response => response.json())
      .then(res => {
        this.props.refreshMe();
        this.props.close();
      });
  };
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  componentDidMount() {
    fetch(`${this.state.address}/api/Category/`)
      .then(response => response.json())
      .then(json => {
        this.setState({
          categories: json,
          categoryId: json[0].id
        });
      });
  }
  render() {
    return (
      <div
        id="myModal"
        style={{ display: this.props.show ? "block" : "none" }}
        className="modal"
      >
        <div className="modal-content">
          <div className="modal-header">
            <span className="close" onClick={this.props.close}>
              &times;
            </span>
            <h2>Add a product </h2>
          </div>
          <div className="modal-body">
            <h5> Product brand</h5>
            <input
              name="brand"
              type="text"
              onChange={this.handleChange}
              value={this.state.brand}
            />
            <h5> Model</h5>
            <input
              name="model"
              type="text"
              onChange={this.handleChange}
              value={this.state.model}
            />
            <h5> Price</h5>
            <input
              name="price"
              type="number"
              onChange={this.handleChange}
              value={this.state.price}
            />
            <h5> Description</h5>
            <input
              name="description"
              type="text"
              onChange={this.handleChange}
              value={this.state.description}
            />
            <h5> Category</h5>
            <select
              onChange={e => this.setState({ categoryId: e.target.value })}
            >
              {this.state.categories &&
                this.state.categories.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="modal-footer">
            <button onClick={this.props.close}>Cancel</button>
            <button onClick={() => this.handleSubmit(this.state.id)}>
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Product />, document.getElementById("ProductsTable"));
