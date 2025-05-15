import React, { Component, createRef } from 'react';
import { Spinner, Card, Alert, Button } from 'react-bootstrap';
import SpecialistsService from '../services/specialists.service';
import { withRouter } from '../utils/withRouter';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

class SpecialistsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            specialists: [],
            loading: false,
            hasMore: true,
            error: null,
            page: 1,
            organizationId: null,
        };
        this.lastCardRef = createRef();
        this.observer = null;
    }

    async componentDidMount() {
        const searchParams = new URLSearchParams(this.props.location.search);
        const orgId = searchParams.get('organization_id');

        if (!orgId) {
            this.setState({ error: 'Отсутствует organization_id в URL', loading: false });
            return;
        }

        this.setState({ organizationId: orgId }, async () => {
            await this.loadMore();
            this.initObserver();
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            this.lastCardRef.current &&
            this.state.specialists.length !== prevState.specialists.length
        ) {
            this.initObserver();
        }
    }

    initObserver() {
        if (this.observer) this.observer.disconnect();

        this.observer = new IntersectionObserver(async (entries) => {
            if (
                entries[0].isIntersecting &&
                this.state.hasMore &&
                !this.state.loading
            ) {
                await this.loadMore();
            }
        });

        if (this.lastCardRef.current) {
            this.observer.observe(this.lastCardRef.current);
        }
    }

    loadMore = async () => {
        const { page, organizationId, specialists } = this.state;

        this.setState({ loading: true });

        try {
            const res = await SpecialistsService.getByOrg(page, ITEMS_PER_PAGE, organizationId);
            const newSpecialists = res.data.items || res;

            this.setState({
                specialists: [...specialists, ...newSpecialists],
                page: page + 1,
                hasMore: newSpecialists.length === ITEMS_PER_PAGE,
                loading: false,
            });
        } catch (err) {
            console.error(err);
            this.setState({
                error: 'Не удалось загрузить специалистов',
                loading: false,
                hasMore: false,
            });
        }
    };

    render() {
        const { specialists, loading, error, hasMore } = this.state;

        if (error) {
            return (
                <div className="container mt-4">
                    <Alert variant="danger">{error}</Alert>
                </div>
            );
        }

        return (
            <div className="container py-4">
                <h2 className="mb-4">Специалисты организации</h2>
                {specialists.length === 0 && !loading ? (
                    <Alert variant="info">Специалистов пока нет</Alert>
                ) : (
                    <div className="row g-4">
                        {specialists.map((spec, index) => (
                            <div
                                className="col-md-4"
                                key={spec._id}
                                ref={index === specialists.length - 1 ? this.lastCardRef : null}
                            >
                                <Card>
                                    <Card.Img
                                        variant="top"
                                        src={`https://i.pravatar.cc/250?u=${encodeURIComponent(spec.fio)}`}
                                        alt={spec.fio}
                                    />
                                    <Card.Body>
                                        <Card.Title>{spec.fio}</Card.Title>
                                        <Card.Text>
                                            <small className="text-muted">ID: {spec._id}</small>
                                        </Card.Text>
                                        <div className="d-flex justify-content-end">
                                            <Button
                                                as={Link}
                                                to={`/specialist/services?specialist_id=${spec._id}`}
                                                variant="primary"
                                                size="sm"
                                            >
                                                Услуги
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="text-center mt-4">
                        <Spinner animation="border" variant="primary" />
                    </div>
                )}

                {!hasMore && specialists.length > 0 && (
                    <div className="text-center mt-4 text-muted">
                        <small>Все специалисты загружены</small>
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(SpecialistsPage);
