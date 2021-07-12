import React from "react";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { faTrash, faPlusSquare, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Axios from "axios";

const maxLength = 200;

class TaskTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [], // sort ascening
            showTaskModal: false,
            nameCharsRemaining: maxLength,
            descriptionCharsRemaining: maxLength,
            editingTask: false,
            newTask: {}
        }
        this.showTaskModal = this.showTaskModal.bind(this);
        this.handleTaskSubmit = this.handleTaskSubmit.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.hideTaskModal = this.hideTaskModal.bind(this);
    }

    componentDidMount() {
        this.getTasks();
    }

    getTasks() {
        Axios.get(`http://localhost:3001/projectTasks/${this.props.projectId}`).then(response => {
            this.setState({ tasks: response.data });
        });
    }

    handleDelete(tid) {
        var _tasks = [...this.state.tasks];
        Axios.delete(`http://localhost:3001/deleteTask/${tid}`).then(response => {
            _tasks = this.state.tasks.filter(t => t.id !== tid);
            this.setState({ tasks: _tasks });
        });
    }

    showTaskModal(task, e) {
        if (e) { e.stopPropagation(); }
        this.setState({ showTaskModal: true });
        if (task) {
            this.setState({
                editingTask: true,
                taskNameBeforeEdit: task.name,
                newTask: task,
                nameCharsRemaining: maxLength - task.name.length,
                descriptionCharsRemaining: maxLength - task.description.length,
            });
        }
    }

    hideTaskModal() {
        this.setState({
            showTaskModal: false,
            editingTask: false,
            taskNameBeforeEdit: null,
            newTask: {},
            nameCharsRemaining: maxLength,
            descriptionCharsRemaining: maxLength
        });
    }

    handleNameChange(e) {
        let newTask = { ...this.state.newTask };
        newTask.name = e.target.value;
        this.setState({
            newTask: newTask,
            nameCharsRemaining: maxLength - e.target.value.length
        });
    }

    handleDescriptionChange(e) {
        let newTask = { ...this.state.newTask };
        newTask.description = e.target.value;;
        this.setState({
            newTask: newTask,
            descriptionCharsRemaining: maxLength - e.target.value.length
        });
    }

    handleTaskSubmit() {
        if (!this.state.newTask.name || !this.state.newTask.description) {
            alert("All fields are required");
            return;
        }
        if (this.state.editingTask) {
            Axios.put(`http://localhost:3001/updateTask/${this.state.newTask.id}`,
            {
                name: this.state.newTask.name,
                description: this.state.newTask.description,
            }).then(() => {
                this.getTasks();
            });
        } else {
            Axios.post(`http://localhost:3001/createTask/${this.props.projectId}`,
                {
                    name: this.state.newTask.name,
                    description: this.state.newTask.description,
                }).then(() => {
                    this.getTasks();
                });
        }
        this.setState({
            showTaskModal: false,
            editingTask: false,
            newTask: {},
            nameCharsRemaining: maxLength,
            descriptionCharsRemaining: maxLength
        });
    }

    render() {
        let taskModalTitle = "";
        if (this.state.editingTask) {
            taskModalTitle = <div>Editing task <i>{this.state.taskNameBeforeEdit}</i></div>
        } else {
            taskModalTitle = <div>New task</div>
        }

        var table;
        if (this.state.tasks.length === 0) {
            table = <h4 className="text-center">This project has no tasks.</h4>
        } else {
            table =
                <Table striped responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.tasks.map((t) => {
                                return (
                                    <tr key={t.id}>
                                        <td>{t.name}</td>
                                        <td>{t.description}</td>
                                        <td className="text-center">
                                            <OverlayTrigger placement="top" delay={{ hide: 100 }} overlay={<Tooltip>Edit this task</Tooltip>}>
                                                <Button variant="primary" onClick={(e) => this.showTaskModal(t, e)}><FontAwesomeIcon icon={faEdit} /></Button>
                                            </OverlayTrigger>
                                        </td>
                                        <td className="text-center">
                                            <OverlayTrigger placement="top" delay={{ hide: 100 }} overlay={<Tooltip>Delete this task</Tooltip>}>
                                                <Button variant="danger" onClick={() => this.handleDelete(t.id)}><FontAwesomeIcon icon={faTrash} /></Button>
                                            </OverlayTrigger>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </Table>
        }
        return (
            <Col xs={12}>
                <Col xs={12} md={{ span: 4, offset: 4 }} className="mb-3 text-center">
                    <Button onClick={() => this.showTaskModal(null)}><FontAwesomeIcon icon={faPlusSquare} /> New Task</Button>
                    <Modal show={this.state.showTaskModal}>
                        <Modal.Header>
                            <Modal.Title>{taskModalTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Task name</Form.Label>
                                <Form.Control as="textarea" maxLength={maxLength} rows={4} value={this.state.newTask.name} onChange={this.handleNameChange}></Form.Control>
                                <small className="text-muted">{this.state.nameCharsRemaining} characters remaining</small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" maxLength={maxLength} rows={4} value={this.state.newTask.description} onChange={this.handleDescriptionChange} />
                                <small className="text-muted">{this.state.descriptionCharsRemaining} characters remaining</small>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={this.handleTaskSubmit}>
                                Submit
                            </Button>
                            <Button variant="secondary" onClick={this.hideTaskModal}>
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
                {table}
            </Col>
        )
    }
}
export default TaskTable;