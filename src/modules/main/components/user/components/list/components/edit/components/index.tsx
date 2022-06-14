import CardComponent from 'components/Card/components';
import { useNavigate, useParams } from 'react-router-dom';
import * as userConstant from 'constants/user';
import * as Yup from 'yup';
import userService from 'services/userService';
import imageService from 'services/imageService';
import { useCallback, useRef, useState } from 'react';
import { UpdateUserFormik } from 'types/user';
import LoadingComponent from 'components/Loading/components';
import toastify from 'helpers/toastify';
import { Image } from 'types/image';
import FormComponent from 'components/Form/components';
import { FormikHelpers } from 'formik';
import { errorHandler } from 'helpers/error';
import * as routeConstant from 'constants/route';
import useAppDispatch from 'hooks/useAppDispatch';
import { userShowDataRequestAction, userShowLoadingRequestAction, userUpdateDataRequestAction, userUpdateLoadingRequestAction } from 'store/user/actions';
import useAppSelector from 'hooks/useAppSelector';
import { selectUserShow, selectUserUpdate } from 'store/user/selectors';
import useOnClickOutside from 'hooks/useClickOutside';
import useLockedScroll from 'hooks/useLockedScroll';
import ButtonComponent from 'components/Button/components';
import useOnceEffect from 'hooks/useOnceEffect';
import useUpdateEffect from 'hooks/useUpdateEffect';

type Props = {};

const EditListUserComponent: React.FC<Props> = () => {
	const outsideRef = useRef(null);
	const navigate = useNavigate();
	const params = useParams();
	const dispatch = useAppDispatch();
	const userShow = useAppSelector(selectUserShow);
	const userUpdate = useAppSelector(selectUserUpdate);
	const [imageUpload, setImageUpload] = useState({ loading: false });

	const initialValues: UpdateUserFormik = {
		first_name: userShow.data.first_name || '',
		last_name: userShow.data.last_name || '',
		email: userShow.data.email || '',
		user_name: userShow.data.user_name || '',
		password: '',
		password_confirmation: '',
		role: userShow.data.role || userConstant.USER_ROLE_MEMBER,
		status: userShow.data.status || userConstant.USER_STATUS_INACTIVE,
		image: null
	};

	const validationSchema = Yup.object({
		first_name: Yup.string().required('The first name is required.').max(20, 'The first name must not be greater than 20 characters.'),
		last_name: Yup.string().required('The last name is required.').max(20, 'The last name must not be greater than 20 characters.'),
		email: Yup.string().required('Email is required.'),
		user_name: Yup.string()
			.required('The user name is required.')
			.min(3, 'The user name must be at least 3 characters.')
			.max(20, 'The user name must not be greater than 20 characters.'),
		password: Yup.string().min(6, 'The password must be at least 6 characters.').max(66, 'The password must not be greater than 66 characters.'),
		password_confirmation: Yup.string().test('passwords-match', 'The password confirmation does not match.', function (value) {
			return this.parent.password === value;
		}),
		role: Yup.string()
			.required('The role is required.')
			.oneOf(
				[userConstant.USER_ROLE_OWNER, userConstant.USER_ROLE_ADMIN, userConstant.USER_ROLE_MODERATOR, userConstant.USER_ROLE_MEMBER],
				'The role invalid.'
			),
		status: Yup.string()
			.required('The status is required.')
			.oneOf([userConstant.USER_STATUS_ACTIVE, userConstant.USER_STATUS_INACTIVE, userConstant.USER_STATUS_BANNED], 'The status invalid.')
	});

	const onSubmit = (values: UpdateUserFormik, formikHelpers: FormikHelpers<UpdateUserFormik>) => {
		new Promise<Image | null>((resolve, reject) => {
			if (!values.image) {
				return resolve(null);
			}
			setImageUpload({ loading: true });
			imageService
				.upload({
					image: values.image
				})
				.then((response) => {
					return resolve(response.data.data);
				})
				.catch((error) => {
					return reject(error);
				})
				.finally(() => {
					setImageUpload({ loading: false });
				});
		})
			.then((result) => {
				dispatch(userUpdateLoadingRequestAction(true));
				const payload = {
					first_name: values.first_name,
					last_name: values.last_name,
					email: values.email,
					user_name: values.user_name,
					role: values.role,
					status: values.status,
					...(values.password && {
						password: values.password
					}),
					...(result && {
						avatar: result.image_name
					})
				};
				userService
					.update(Number(params.userId), payload)
					.then((response) => {
						dispatch(userUpdateDataRequestAction(response.data.data));
						toastify.success('User updated successfully');
					})
					.catch(errorHandler(undefined, (validationError) => formikHelpers.setErrors(validationError.data.errors)))
					.finally(() => {
						dispatch(userUpdateLoadingRequestAction(false));
					});
			})
			.catch(errorHandler(undefined, (validationError) => formikHelpers.setErrors(validationError.data.errors)))
			.finally(() => {});
	};

	const userShowDataCallback = useCallback(() => {
		dispatch(userShowLoadingRequestAction(true));
		userService
			.show(Number(params.userId))
			.then((response) => {
				dispatch(userShowDataRequestAction(response.data.data));
			})
			.catch(errorHandler())
			.finally(() => {
				dispatch(userShowLoadingRequestAction(false));
			});
	}, [dispatch, params.userId]);

	useOnceEffect(() => {
		userShowDataCallback();
	});

	useUpdateEffect(() => {
		userShowDataCallback();
	}, [userShowDataCallback]);

	useOnClickOutside(outsideRef, () => {
		navigate(`/${routeConstant.ROUTE_NAME_MAIN}/${routeConstant.ROUTE_NAME_MAIN_USER}`);
	});

	useLockedScroll();

	return (
		<div className="h-full w-full fixed overflow-x-hidden overflow-y-auto z-50 top-0 left-0">
			<div className="min-h-full flex items-center py-8 sm:px-16 bg-gray-900/50 z-40 justify-center">
				<CardComponent
					ref={outsideRef}
					className="max-w-5xl z-50"
					header="Edit user"
					onClickClose={() => navigate(`/${routeConstant.ROUTE_NAME_MAIN}/${routeConstant.ROUTE_NAME_MAIN_USER}`)}
				>
					{userShow.loading ? (
						<LoadingComponent />
					) : !Object.keys(userShow.data).length ? (
						<div className="flex justify-center">Not found</div>
					) : (
						<FormComponent<UpdateUserFormik> initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
							{(props) => (
								<div className="grid grid-cols-2 gap-4">
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Input
											id="first_name"
											type="text"
											label="First name"
											placeholder="Enter first name"
											error={props.errors.first_name}
											touched={props.touched.first_name}
											{...props.getFieldProps('first_name')}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Input
											id="last_name"
											type="text"
											label="Last name"
											placeholder="Enter last name"
											error={props.errors.last_name}
											touched={props.touched.last_name}
											{...props.getFieldProps('last_name')}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Input
											id="user_name"
											type="text"
											label="User name"
											placeholder="Enter user name"
											error={props.errors.user_name}
											touched={props.touched.user_name}
											autoComplete="username"
											{...props.getFieldProps('user_name')}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Input
											id="email"
											type="text"
											label="Email"
											placeholder="Enter email"
											error={props.errors.email}
											touched={props.touched.email}
											{...props.getFieldProps('email')}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Input
											id="password"
											type="password"
											label="Password"
											placeholder="Enter password"
											error={props.errors.password}
											touched={props.touched.password}
											autoComplete="new-password"
											{...props.getFieldProps('password')}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Input
											id="password_confirmation"
											type="password"
											label="Password confirmation"
											placeholder="Enter password confirmation"
											error={props.errors.password_confirmation}
											touched={props.touched.password_confirmation}
											autoComplete="new-password"
											{...props.getFieldProps('password_confirmation')}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Select
											id="role"
											label="Role"
											options={[
												{
													value: userConstant.USER_ROLE_MEMBER,
													label: 'Member'
												},
												{
													value: userConstant.USER_ROLE_MODERATOR,
													label: 'Moderator'
												},
												{
													value: userConstant.USER_ROLE_ADMIN,
													label: 'Admin'
												},
												{
													value: userConstant.USER_ROLE_OWNER,
													label: 'Owner'
												}
											]}
											error={props.errors.role}
											touched={props.touched.role}
											{...props.getFieldProps('role')}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Select
											id="status"
											label="Status"
											options={[
												{
													value: userConstant.USER_STATUS_INACTIVE,
													label: 'Inactive'
												},
												{
													value: userConstant.USER_STATUS_ACTIVE,
													label: 'Active'
												},
												{
													value: userConstant.USER_STATUS_BANNED,
													label: 'Banned'
												}
											]}
											error={props.errors.status}
											touched={props.touched.status}
											{...props.getFieldProps('status')}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<FormComponent.Image
											id="image"
											label="Avatar"
											error={props.errors.image}
											touched={props.touched.image}
											onChangeFile={props.setFieldValue}
											onBlurFile={props.setFieldTouched}
											imgUrl={userShow.data.avatar_url}
											{...props.getFieldProps('image')}
										/>
									</div>
									<div className="col-span-2 flex flex-row-reverse">
										<ButtonComponent
											type="submit"
											loading={imageUpload.loading || userUpdate.loading}
											disabled={imageUpload.loading || userUpdate.loading}
										>
											{imageUpload.loading ? 'Uploading' : userUpdate.loading ? 'Updating' : 'Update'}
										</ButtonComponent>
									</div>
								</div>
							)}
						</FormComponent>
					)}
				</CardComponent>
			</div>
		</div>
	);
};

export default EditListUserComponent;
