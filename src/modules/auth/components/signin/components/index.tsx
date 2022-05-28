import { setCookie } from 'helpers/cookies';
import { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import CardComponent from 'components/Card/components';
import * as cookiesConstant from 'constants/cookies';
import * as routeConstant from 'constants/route';
import config from 'config';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import LinkComponent from 'components/Link/components';
import authService from 'services/authService';
import { SigninFormik } from 'models/auth';
import FormComponent from 'components/Form/components';
import { Fragment } from 'react';
import toastify from 'helpers/toastify';
import { errorHandler } from 'helpers/error';
import ButtonComponent from 'components/Button/components';

type Props = {};

const SigninCompoment: React.FC<Props> = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as { from: Location })?.from;

	const initialValues: SigninFormik = {
		user_name: '',
		password: '',
		remember_me: false
	};

	const validationSchema = Yup.object({
		user_name: Yup.string().required('The user name is required.'),
		password: Yup.string().required('The password is required.')
	});

	const onSubmit = (values: SigninFormik, formikHelpers: FormikHelpers<SigninFormik>) => {
		const payload = {
			user_name: values.user_name,
			password: values.password,
			remember_me: values.remember_me
		};
		authService
			.signin(payload)
			.then((response) => {
				setCookie(cookiesConstant.COOKIES_KEY_TOKEN, response.data.data.token, {
					expires: config.AUTH_DATA.EXPIRED_TIME
				});
				toastify.success('Sign in success');
				navigate(routeConstant.ROUTE_NAME_SPLASH, { state: { from: from } });
			})
			.catch(
				errorHandler(
					(axiosError) => {},
					(stockError) => {},
					(formError) => formikHelpers.setErrors(formError.data.errors)
				)
			)
			.finally(() => {
				formikHelpers.setSubmitting(false);
			});
	};

	return (
		<CardComponent className="m-auto flex flex-col w-full max-w-md sm:p-8">
			<div className="text-xl font-light text-gray-600 sm:text-2xl text-center mb-8">Sign in to your Account</div>
			<FormComponent<SigninFormik> initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
				{(formik) => (
					<Fragment>
						<div className="flex flex-col mb-4">
							<FormComponent.Input
								type="text"
								label="User name"
								placeholder="Enter user name"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.user_name}
								isError={!!(formik.errors.user_name && formik.touched.user_name)}
								errorMessage={formik.errors.user_name}
								name="user_name"
								id="user_name"
							/>
						</div>
						<div className="flex flex-col mb-4">
							<FormComponent.Input
								type="password"
								label="Password"
								placeholder="Enter password"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.password}
								isError={!!(formik.errors.password && formik.touched.password)}
								errorMessage={formik.errors.password}
								name="password"
								id="password"
							/>
						</div>
						<div className="flex items-center justify-between mb-6">
							<FormComponent.Checkbox
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								checked={formik.values.remember_me}
								isError={!!(formik.errors.remember_me && formik.touched.remember_me)}
								errorMessage={formik.errors.remember_me}
								name="remember_me"
								id="remember_me"
							>
								Remember me
							</FormComponent.Checkbox>
							<div className="text-sm">
								<LinkComponent to="/" className="font-medium text-purple-600">
									Forgot your password?
								</LinkComponent>
							</div>
						</div>
						<div className="flex w-full">
							<ButtonComponent className="w-full" isLoading={formik.isSubmitting} disabled={formik.isSubmitting}>
								{formik.isSubmitting ? 'Signing in' : 'Sign in'}
							</ButtonComponent>
						</div>
					</Fragment>
				)}
			</FormComponent>
			<div className="relative my-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-gray-400"></div>
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="px-2 text-neutral-700 bg-white leading-none"> Or continue with </span>
				</div>
			</div>
			<div className="flex items-center justify-center">
				<span className="leading-none text-sm">
					Do you have an account?
					<LinkComponent className="text-purple-600 ml-1" to="/auth/signup">
						Sign up
					</LinkComponent>
				</span>
			</div>
		</CardComponent>
	);
};

export default SigninCompoment;
